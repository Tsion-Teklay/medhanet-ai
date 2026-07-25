# መድሃኔት AI (MedhaNet AI)

AI-powered healthcare intelligence network connecting patients, pharmacies, and healthcare
systems in Ethiopia.

## Structure
- `backend/` — Node.js + Express + Prisma API (port 5000)
- `ai/` — Python FastAPI AI services (port 8000)
- `web/` — React dashboard for pharmacies and admins (port 5173)
- `mobile/` — React Native (Expo) patient app

## Stack
Node.js/Express · MySQL 8 · Prisma · Python FastAPI · React · React Native (Expo)

## Running locally

One-time, per app: copy each `.env.example` to `.env` and fill it in
(`backend/`, `ai/`, `web/`).

```powershell
cd backend
npm install
npx prisma migrate deploy
npm run seed
```

Then run `.\dev.ps1` from the root to start backend, ai, and web together.

## Demo accounts

Seeded by `npm run seed`, all with password `password123`:

| Role | Phone |
|---|---|
| Admin | `0911000000` |
| Patient | `0922000000` |
| Pharmacy | `0933000010` … `0933000021` |

## API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/health` | |
| `POST` | `/api/auth/register` | `{ phone, password, name, role? }` |
| `POST` | `/api/auth/login` | `{ phone, password }` |
| `GET` | `/api/auth/me` | requires `Authorization: Bearer <token>` |
| `GET` | `/api/medicines?q=` | catalogue browse |
| `GET` | `/api/medicines/:id` | |
| `GET` | `/api/search?q=&lat=&lng=&radiusKm=` | nearby verified pharmacies with stock |

Pharmacy portal (role `PHARMACY`, own pharmacy only):

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/pharmacy` | onboarding: create the (PENDING) pharmacy |
| `GET` `PATCH` | `/api/pharmacy/me` | profile, opening hours, open/closed |
| `GET` `POST` | `/api/pharmacy/inventory` | list / add stock |
| `PATCH` `DELETE` | `/api/pharmacy/inventory/:id` | update quantity, price, expiry / remove |
| `POST` | `/api/pharmacy/inventory/bulk` | `{ items: [...] }` from a parsed CSV |
| `GET` | `/api/pharmacy/stats` | inventory value, low stock, expiring soon |

Admin (role `ADMIN`):

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/admin/pharmacies?status=&q=` | verification queue |
| `GET` | `/api/admin/pharmacies/:id` | licence details for review |
| `PATCH` | `/api/admin/pharmacies/:id/status` | `{ status, rejectionReason? }` |
| `GET` | `/api/admin/stats` | platform totals |