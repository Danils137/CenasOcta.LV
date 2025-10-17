# OCTA Insurance Platform

Страховая платформа OCTA с интеграцией Supabase и развертыванием в Vercel.

## 🚀 Быстрый запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск веб-версии
npm run web

# Запуск мобильной версии
npm run ios      # iOS
npm run android  # Android
```

### Деплой в Vercel

1. **Создайте аккаунт в Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Зарегистрируйтесь с GitHub

2. **Настройте переменные окружения в Vercel:**
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://ufjcdiyhdbxyylupselm.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Загрузите проект:**
   ```bash
   # Соберите веб-версию
   npm run export

   # Загрузите в Vercel
   vercel --prod
   ```

## 🛠 Архитектура

```
┌─────────────────┐    ┌──────────────────┐
│   Vercel        │    │   Supabase       │
│   (Frontend)    │◄──►│   (Backend)      │
│                 │    │                  │
│ • React/Expo    │    │ • Authentication │
│ • Static Site   │    │ • Database       │
│ • CDN           │    │ • Real-time      │
└─────────────────┘    └──────────────────┘
```

## 📁 Структура проекта

```
├── src/lib/supabaseClient.js    # Supabase клиент
├── contexts/AuthContext.tsx     # Аутентификация
├── components/LoginModal.tsx    # Модальное окно входа
├── app/                         # Страницы приложения
├── .env.local                   # Локальные переменные
├── vercel.json                  # Конфигурация Vercel
└── package.json                 # Зависимости
```

## 🔐 Supabase настройки

Проект уже настроен с правильными ключами Supabase:
- **URL:** `https://ufjcdiyhdbxyylupselm.supabase.co`
- **Anon Key:** Настроен в `.env.local`

### Проверка подключения

1. Запустите приложение локально
2. Нажмите "Test Supabase Connection"
3. Проверьте в [Supabase Dashboard](https://supabase.com/dashboard/project/ufjcdiyhdbxyylupselm/auth/users)

## 🌐 Фичи

- ✅ Аутентификация пользователей через Supabase
- ✅ Адаптивный дизайн для мобильных и веб
- ✅ Многоязычная поддержка
- ✅ Интеграция с страховыми компаниями
- ✅ Управление страховыми полисами

## 🔧 Разработка

### Добавление новых фич

1. **Компоненты:** `components/`
2. **Страницы:** `app/`
3. **Стили:** Используйте NativeWind/Tailwind
4. **API:** Через Supabase клиент

### Переменные окружения

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## 📱 Мобильное приложение

Для сборки мобильного приложения:

```bash
# Требуется EAS CLI
npm install -g @expo/eas-cli

# Сборка
eas build --platform ios
eas build --platform android
```

## 🚀 Продакшн

- **Веб-версия:** Развернута в Vercel
- **Мобильное приложение:** App Store / Google Play
- **База данных:** Supabase
- **Аутентификация:** Supabase Auth

## 🔍 Мониторинг

- **Vercel Dashboard:** Мониторинг веб-приложения
- **Supabase Dashboard:** Мониторинг базы данных и аутентификации
- **Логи:** Доступны в консоли браузера и Supabase

---

**Разработано для OCTA страховой платформы** 🎯
