# The Ready Brand — Web App

Vite + React + TypeScript + Tailwind frontend for **The Ready Brand** job marketplace and CV service orders.

## Run

```bash
npm install
npm run dev
```

App: `http://localhost:5173`

## Demo accounts (mock data)

| Role | Email | Password |
|------|-------|----------|
| Seeker | ada@example.com | password |
| Hirer | hiring@novatech.ng | password |
| Admin | admin@thereadybrand.com | Admin123! |

Data persists in `localStorage` (`ready-brand-mock-db`). Clear site data to reset fixtures.

## Stack

- React Router for public + role dashboards
- `src/lib/mockApi.ts` mirrors the Express API shape
- Types in `src/types/` align with `resume-platform-api`

## Backend (separate project)

Sibling repo: `../resume-platform-api`

```bash
cd ../resume-platform-api
cp .env.example .env
npm install
npm run dev
```

### Future wiring

When connecting the real API, set:

```env
VITE_API_URL=http://localhost:4000/api
```

Then replace `mockApi` calls with `fetch(`${import.meta.env.VITE_API_URL}/...`)` and send `Authorization: Bearer <token>`.
