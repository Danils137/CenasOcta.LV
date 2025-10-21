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

## Связанные файлы
- `contexts/AuthContext.tsx` - основная логика авторизации
- `src/lib/authService.js` - Supabase методы
- `components/UserProfile.tsx` - UI компонент logout
- `components/LoginModal.tsx` - UI логина/регистрации
