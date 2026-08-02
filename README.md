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

how passenger book.
login -> book-seat ui -> should be able to select origin and destination -> see available trains that have available seats -> click seat(start hold timer) -> show quote price -> proceed to demo payment -> payment success -> booking success for that specific trains coache's seat.

my appraoch for occupancy and segment modeling
1. use half open intervals
    By modeling a leg like Colombo Fort → Kandy as [originIndex, destinationIndex), a passenger getting off at Kandy (index 5) and another boarding at Kandy for Badulla (index 5 to 10) do not overlap.
2. using the overlap identifiable logic as `existingStart < requestedEnd && requestedStart < existingEnd`
3. allocations like hold and confirmed are tied to the schedule. this keeps passenger data seperate.

for concurrency
4. by using PostgreSQL GiST - Generalized Seach Tree's exclusion rule to identify overlapping segments on the same seat are rejected atomically at database level

for pricing
5. (flat booking fee + distance based charge(rs per/km)) * coach class charge * peak/offpeak charge


