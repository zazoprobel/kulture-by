# kulture-by

Портал для поиска интересных мест Беларуси: каталог мест и площадок, карта с кластеризацией, фильтры, SEO-страницы категорий/городов и админка для управления контентом.

Прод: `https://kulture-by.vercel.app/`

## Технологии

- `Next.js 16` (App Router)
- `React 19` + `TypeScript`
- `Supabase` (Postgres, Auth, Storage, RLS)
- `zod` для валидации форм
- `sharp` для обработки изображений
- `Tailwind CSS v4` (в проекте также используются inline/CSS-in-JSX стили)
- `Leaflet` + `markercluster` (подключаются с CDN в рантайме)

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env.local` и задать переменные:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# необязательно, но желательно для корректных canonical URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Подготовить базу данных (Supabase):

- применить SQL из `supabase/migrations/` по порядку;
- при необходимости загрузить seed-данные из SQL-файлов.

4. Запуск в dev-режиме:

```bash
npm run dev
```

5. Production-проверка:

```bash
npm run build
npm run start
```

## Скрипты

- `npm run dev` - запуск локального сервера Next.js
- `npm run build` - production-сборка
- `npm run start` - запуск собранного приложения
- `npm run lint` - проверка линтером (`eslint`)

## Основные разделы приложения

### Публичные

- `/` - главная страница
- `/places` - каталог мест с фильтрами и пагинацией
- `/places/[slug]` - SEO-страница категории/города или карточка места (в зависимости от slug)
- `/venues` - каталог площадок
- `/venues/[slug]` - карточка площадки
- `/maps` - карта мест с поиском, слоями категорий, кластеризацией и геолокацией

### Авторизация

- `/login`
- `/register`

### Админка

- `/admin` - dashboard
- CRUD-разделы:
  - `/admin/places`
  - `/admin/venues`
  - `/admin/contractors`
  - `/admin/stories`
  - `/admin/events`
  - `/admin/tours`
  - `/admin/users`

Доступ в админку ограничен ролью `admin`.

## Данные и инфраструктура

- Основные сущности: `places`, `venues`, `contractors`, `events`, `stories`, `tours`, `profiles`
- SQL-миграции: `supabase/migrations/`
- Медиафайлы админки: Supabase Storage bucket `kulture-media`
- RLS-политики и доступы задаются миграциями

## Импорт контента

В репозитории есть утилиты для генерации SQL из OSM/Wikipedia:

- `osm_belarus_scraper.js`
- `osm_belarus_scraper_v2.js`
- `belarus_osm_places.sql`
- `scripts/generate_belarus_venues_from_osm.mjs`

Эти файлы нужны для наполнения базы, а не для runtime-логики фронтенда.

### Импорт площадок и ресторанов по крупным городам

Сгенерировать SQL по OSM для `venues` (рестораны/отели/ивент-площадки):

```bash
npm run data:venues:osm
```

После выполнения появится файл `belarus_osm_venues.sql`, который можно применить в Supabase SQL Editor.

## Важные замечания

- Без `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` часть страниц не работает.
- Для загрузки изображений в админке нужен `SUPABASE_SERVICE_ROLE_KEY`.
- Карта зависит от внешних ресурсов (`unpkg` и OpenStreetMap tiles), без сети может не отображаться.
- В проекте могут встречаться ссылки на маршруты, которых нет в `app/` (например `/guide`).
