# MacroMenu

MacroMenu is a responsive nutrition-tracking product for restaurant meals. It includes restaurant discovery, menu browsing, search, macro filters, favorites, live portion-aware meal totals, saved-meal affordances, dark mode, a mobile meal drawer, API routes, a Prisma data model, and a hidden admin console at `/admin`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Data layer

The interactive demo uses the typed catalog in `lib/data.ts`. The production-ready PostgreSQL schema is in `prisma/schema.prisma`, with models for users, restaurants, menu items, saved meals, saved meal items, and favorites.

The included route handlers expose:

- `GET /api/restaurants`
- `GET /api/restaurant/:id`
- `GET /api/menu-items`
- `GET /api/search?q=`
- `POST|PUT|DELETE /api/saved-meals`
- `GET|POST /api/favorites`

The write routes are intentionally shaped for authenticated persistence and currently return demo responses until a database connection and auth provider are configured.
