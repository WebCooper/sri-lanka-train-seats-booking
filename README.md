# Segment-Based Train Seat Booking — Colombo Fort–Badulla

A production-minded booking system for Sri Lanka’s scenic Colombo Fort–Badulla line. A single reserved seat can be sold for multiple **non-overlapping** legs of the same journey, with each passenger charged only for the distance they travel.

## Stack

| Layer | Tech |
|-------|------|
| API | NestJS 11, Prisma, PostgreSQL, Better Auth |
| Public client | Next.js 16 (App Router) |
| Admin | Vite + React |
| Infra | Docker Compose |

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Public web | http://localhost:3000 |
| Admin | http://localhost:5173 |
| API | http://localhost:3001 |
| Auth | http://localhost:3001/api/auth/* |

**Demo accounts** (seeded):

- Admin: `admin@trainbooking.lk` / `Admin123!`
- Passenger: `passenger@example.com` / `Passenger123!`

### Local development (without Docker for apps)

1. Start Postgres: `docker compose up postgres -d`
2. Backend: `cd backend && npm install && npx prisma migrate deploy && npx prisma db seed && npm run start:dev`
3. Web: `cd web && npm install && npm run dev`
4. Admin: `cd admin && npm install && npm run dev`

## Core design decisions

See the [Design decisions](#design-decisions) section below (filled in as the system is implemented).

## Project layout

```
backend/   NestJS API + Prisma + Better Auth
web/       Next.js public booking UI
admin/     Vite admin (occupancy / revenue)
```

## License

Interview assignment — LSF SE Interview 2026.
