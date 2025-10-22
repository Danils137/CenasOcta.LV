# Исправления системы авторизации

## Проблема
После регистрации пользователь не мог выполнить logout - кнопка не работала или состояние не обновлялось.

## Причина
1. **Дублирование логики очистки**: И функция `logout()`, и обработчик `onAuthStateChange` пытались очистить storage и состояние одновременно, создавая race condition.
2. **Недостаточная обработка ошибок**: При проблемах с Supabase не было надежного fallback механизма.

## Внесенные изменения

### 1. AuthContext.tsx - функция logout()
**До:**
- Вызывала `signOut()`
- Вручную очищала весь storage
- Вручную устанавливала `setUser(null)`
- Это создавало конфликт с `onAuthStateChange` listener

**После:**
- Вызывает `signOut()` и **доверяет** обработчику `onAuthStateChange` выполнить очистку
- Fallback механизм срабатывает только если Supabase logout не удался
- Более чистый и предсказуемый поток

```typescript
const logout = async () => {
  try {
    // Вызываем signOut - это запустит SIGNED_OUT событие
    await signOut();
    // onAuthStateChange обработает остальное
  } catch (error) {
    // Fallback: если Supabase не работает, чистим локально
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => key.startsWith('sb-'));
    await AsyncStorage.multiRemove([...supabaseKeys, 'userData']);
    setUser(null);
  }
};
```

### 2. AuthContext.tsx - onAuthStateChange listener
**До:**
- Удалял только конкретные ключи с хардкодом project reference
- Не было обработки ошибок

**После:**
- Динамически находит ВСЕ Supabase ключи (начинающиеся с 'sb-')
- Удаляет все связанные ключи включая 'userData' и 'authToken'
- Обрабатывает ошибки с fallback на очистку состояния

```typescript
else if (event === 'SIGNED_OUT') {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => key.startsWith('sb-'));
    await AsyncStorage.multiRemove([...supabaseKeys, 'userData', 'authToken']);
    setUser(null);
  } catch (error) {
    // Даже если storage не очистился, очищаем UI состояние
    setUser(null);
  }
}
```

## Тестирование

### Как проверить исправление:

1. **Регистрация нового пользователя:**
   ```
   - Откройте приложение
   - Нажмите Login -> Register
   - Заполните форму регистрации
   - После успешной регистрации вы должны быть залогинены
   ```

2. **Logout:**
   ```
   - Нажмите на профиль пользователя (иконка с именем)
   - Выберите "Logout" из выпадающего меню
   - Подтвердите logout
   - Состояние должно измениться на "Login" кнопку
   - В консоли должны появиться логи:
     🔄 Starting logout process...
     ✅ Supabase sign out called
     🚪 User signed out from Supabase
     🗑️ Removing keys: [...]
     ✅ Local state cleared successfully
   ```

3. **Проверка очистки storage:**
   ```javascript
   // В React Native Debugger или через логи
   // После logout не должно быть:
   - sb-* ключей (Supabase токены)
   - userData
   - authToken
   ```

## Дополнительные улучшения

### authService.js
- Добавлена функция `diagnoseAuth()` для отладки
- Улучшены логи для отслеживания состояния

### Рекомендации
1. Проверьте что Supabase email confirmation настроен правильно
2. Убедитесь что `.env.local` содержит правильные ключи
3. При проблемах используйте консольные логи для диагностики

## Критическое исправление (22.10.2025)

### 🚨 Проблема с авторизацией на веб-сайте
**Симптомы:**
- Пользователь видит себя как авторизованного на сайте
- Кнопка "Logout" не работает
- После logout пользователь остается в системе

**Причина:** AuthContext использовал AsyncStorage (React Native API), который не работает в веб-браузерах. В веб-версии Supabase использует localStorage.

**Решение:** Создана универсальная утилита `storage`, которая автоматически выбирает правильный API:
- **React Native:** AsyncStorage
- **Web браузер:** localStorage

### 🔧 Измененные файлы:

#### 1. `contexts/AuthContext.tsx` - ГЛАВНОЕ ИСПРАВЛЕНИЕ
```typescript
// Утилита для работы с хранилищем (AsyncStorage для RN, localStorage для Web)
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      // React Native
      return await AsyncStorage.getItem(key);
    } else {
      // Web
      return localStorage.getItem(key);
    }
  },
  // ... остальные методы
};
```

**Результат:** Теперь logout корректно очищает localStorage в веб-браузере и пользователь выходит из системы.

#### 2. `src/lib/authService.js` - Улучшена диагностика
- Обновлена функция `diagnoseAuth()` для проверки обоих типов хранилища
- Добавлена проверка AsyncStorage для React Native

### 3. Предыдущие улучшения (сохранены)

#### Удалена устаревшая функция `refreshUserData()`
**Проблема:** Обращалась к несуществующему бэкенду `localhost:5000`
**Решение:** Полностью удалена из кода

#### Добавлена функция восстановления пароля
**Файл `src/lib/authService.js`:**
```javascript
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'your-app://reset-password',
  });

  if (error) throw error;
  return { success: true, data };
}
```

**Файл `components/LoginModal.tsx`:**
- Добавлен таб 'forgot-password'
- UI для ввода email и отправки ссылки восстановления
- Кнопка "Back to Login"

### 📋 Тестирование исправления

**Для веб-сайта:**
1. Откройте сайт в браузере
2. Если видите себя авторизованным - нажмите "Logout"
3. ✅ Должны увидеть кнопку "Login" вместо профиля пользователя
4. ✅ В localStorage не должно остаться Supabase ключей

**Проверка в консоли:**
```javascript
// В браузере откройте DevTools → Console
diagnoseAuth()
```

**Ожидаемый результат:**
```
🔍 Diagnosing authentication state...
📋 Session status: None
👤 Current user: None
💾 Supabase localStorage keys: []
```

## Связанные файлы
- `contexts/AuthContext.tsx` - основная логика авторизации (обновлен: удалена refreshUserData)
- `src/lib/authService.js` - Supabase методы (обновлен: добавлена resetPassword)
- `components/UserProfile.tsx` - UI компонент logout
- `components/LoginModal.tsx` - UI логина/регистрации (обновлен: добавлен функционал восстановления пароля)
