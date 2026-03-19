# Kulture.by — Контекст проекта

Краткий файл-памятка для быстрого входа в проект при открытии Cursor.

## 1) Что это за проект
- Стек: `Next.js 16` (App Router) + `TypeScript` + `Supabase`.
- Концепция: **интересные места Беларуси + путеводитель по городам + площадки для мероприятий**.
- Основной бренд: **Культура События / kulture.by**.

## 2) Важные env-переменные
Обязательны в `kulture-by/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Если переменные не заданы:
- `proxy.ts` не должен падать (публичные роуты работают, `/cabinet` редиректит на `/login`).
- страницы с server-запросами к Supabase используют fallback и не должны отдавать 500.

## 3) Ключевые файлы
- `app/page.tsx` — главная (новая структура под places/guide/venues).
- `app/places/page.tsx` — каталог мест с фильтрацией по категориям и SSR-данными.
- `components/layout/Header.tsx` — шапка + строка поиска.
- `components/layout/Footer.tsx` — подвал.
- `components/layout/Container.tsx` — единый контейнер (`max-width` + paddings).
- `lib/supabase/client.ts` — browser client.
- `lib/supabase/server.ts` — server client.
- `proxy.ts` — auth/session proxy для Next.js 16.

## 4) Текущие маршруты (минимум)
- `/` — главная.
- `/places` — каталог мест.
- `/login`, `/register` — auth страницы.

## 5) Supabase схема (уже есть)
- Миграции: `supabase/migrations/*`
- Основные таблицы: `profiles`, `places`, `venues`, `contractors`, `events`, `stories`, `tours`.
- Добавлены seed-данные по городам Беларуси.

## 6) Договоренности по UI/контенту
- Цвета/стиль: сохранять текущую палитру (`#D2F882`, `#FFF57D`, `#E7D4FF`, `#FFBD7B`, `#E2F8D0`, `#181818`, `#F7F6F2`).
- Шрифты: `Unbounded` + `Onest`.
- Навигация в шапке: `Места`, `Площадки`, `Путеводитель`, `О нас`.
- В проекте акцент на places/guide, без возврата к старому фокусу на афишу.

## 7) Проверка перед коммитом
```bash
npm run build
```

Если сборка падает:
- проверить cwd (нужно запускать из `.../dev/kulture-by`);
- проверить `.env.local`;
- проверить, что proxy/server-клиент не бросают фатальные ошибки без fallback.

## 8) Полезные команды
```bash
cd "/Users/zazopro/dev/kulture-by"
npm install
npm run dev
npm run build
```

## 9) Внешний архитектурный ориентир
Есть отдельная карта сайта/архитектуры (HTML-файл), которую используем как главный референс для новых страниц и флоу (roles/comms/auto/flows/ads).
