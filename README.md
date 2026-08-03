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

From a clean machine with only **Docker** installed:

```bash
git clone <repo-url>
cd Train-Booking-Sri-Lanka
cp .env.example .env          # then set BETTER_AUTH_SECRET (any long random string)
docker compose up --build
```

That single command is fully self-contained:

1. **postgres** starts and becomes healthy.
2. **migrate** (one-shot) runs `prisma migrate deploy` to create all tables, then seeds
   stations and the fare model, and exits.
3. **backend**, **admin**, and **web** start only after the migration/seed completes.

No manual `prisma migrate` / `prisma db push` step is required — it happens inside the
compose run.

| Service | URL |
|---------|-----|
| Public web | http://localhost:3000 |
| Admin | http://localhost:5173 |
| API | http://localhost:5000 |
| Auth | http://localhost:5000/api/auth/* |

> The only value you must set by hand in `.env` is `BETTER_AUTH_SECRET`. Everything else
> has working defaults for local Docker.

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

how passenger book.
login -> book-seat ui -> should be able to select origin and destination -> see available trains that have available seats -> click seat(start hold timer) -> show quote price -> proceed to demo payment -> payment success -> booking success for that specific trains coache's seat.

my approach for occupancy and segment modeling
1. use half open intervals
    By modeling a leg like Colombo Fort → Kandy as [originIndex, destinationIndex), a passenger getting off at Kandy (index 5) and another boarding at Kandy for Badulla (index 5 to 10) do not overlap.
2. using the overlap identifiable logic as `existingStart < requestedEnd && requestedStart < existingEnd`
3. allocations like hold and confirmed are tied to the schedule. this keeps passenger data seperate.

for concurrency
4. by using PostgreSQL GiST - Generalized Seach Tree's exclusion rule to identify overlapping segments on the same seat are rejected atomically at database level

for pricing
5. (flat booking fee + distance based charge(rs per/km)) * coach class charge * peak/offpeak charge

## Admin revenue APIs

**Problem:** Admins need live financial visibility from segment-based bookings — not static reports.

**Solution:** Five read-only endpoints under `/api/v1/admin/reports/revenue/*`. All aggregate `fareAmount` from `CONFIRMED` `SeatSegmentAllocation` rows. Admin auth required (`@AdminOnly` + `AuthGuard` + `RolesGuard`).

**Design:** One shared filter DTO (`date_from`, `date_to`, `line_id`, `schedule_id`, `train_id`). Each endpoint answers one chart/KPI. Revenue source is always confirmed segment fares — no separate booking table.

| Endpoint | What it shows |
|----------|---------------|
| `GET .../summary` | Gross revenue, booking count, average fare |
| `GET .../over-time?granularity=daily\|weekly\|monthly` | Revenue trend by `createdAt` bucket |
| `GET .../by-schedule` | Top train runs by total fare |
| `GET .../by-coach-class` | Revenue split across FIRST / SECOND / THIRD / OBSERVATION |
| `GET .../segment-efficiency` | Seats sold multiple times on one run — proves segment pricing upside |

