# Ticket Booking API

Backend assignment for a ticketing system with concurrency-safe booking using PostgreSQL row-level locking.

# Locking Strategy & Concurrency Handling

## What was the overselling problem?
A: In a high-traffic ticketing system, multiple users may attempt to book the same limited set of seats at the exact same time. Without proper concurrency control, each request can read the same stale availability value (for e.g., remaining = 5) and independently decide that seats are available. When these requests then update the database concurrently, the system may sell more tickets than the actual capacity. This race condition results in overselling, which is a common failure in booking systems

## What exact mechanism did I implement?
A: Firstly, I chose a SQL database due to its ACID properties, then I implemented concurrency control using transactions with row-level locking.

1. The booking system uses a single database transaction (like BEGIN -> COMMIT or ROLLBACK).
2. A row-level exclusive lock on the target section using:
```SELECT ... FROM sections WHERE id = ? AND event_id = ? FOR UPDATE```

This ensures that when one booking request is checking and updating the remaining seat count for a section, all other concurrent requests targeting the same section are blocked until the transaction completes. Only after the lock is released can the next request read the updated state.

## Why is this safe (or safe enough) in this setup?
This approach is safe because the database enforces serialization of conflicting writes through row level locking. Even if multiple booking requests arrive at the same millisecond, only one transaction can exist in the lock at a time, while others wait.

Because the availability check and seat deduction happen within the same transaction, race conditions are eliminated. I also enforced database constrains like ```remaining >= 0``` and ```remaining <= capacity``` to further minimize the number of invalid states.

## What would we improve in a real production system?
1. Seat reservation: Introduce temporary reservations (e.g., lockedSeats like in the sample API) to handle checkout abandonment and payment delays.
2. Better Error Handling: The error handling of this project can be increased more by detailed error and handling other edge cases.
3. Idempotency keys: Integration of idempotent keys would prevent duplicate booking caused by network failures or retries.
4. Caching: This locking mechanism can be scaled using Redis or similar systems.



## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Setup
1) Install deps:
```bash
npm install
```
2) Create `.env` (copy/edit from `.env.example`):
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=onlybees
```
3) Create schema:
```bash
psql -h localhost -p 5432 -U postgres -d onlybees -f db/schema.sql
```
4) Seed data (creates event 99/section 100 with capacity 5):
```bash
psql -h localhost -p 5432 -U postgres -d onlybees -f db/seed.sql
```
5) Run the API:
```bash
npm run start
```

## Endpoints
- POST /events/create - Creates event with sections (remaining initialized to capacity).
- GET /events/:id - Fetches event and sections (capacity, remaining).
- GET /bookings - Lists all the bookings with event & section info.
- POST /book - Books seats with locking.

## Concurrency Test Script
Seeds include a deterministic test object (event 99, section 100, capacity 5). Run:
```bash
npm run concurrency:test
```

Script behavior:
- Fires 10 parallel POST /book requests with 5 quantity of tickets.
- Prints success/failure counts and sample errors.
- Fetches the section after the run to report capacity, remaining, and total booked by the run, warning if oversell is detected.

## Notes
- If you change seed data, update TEST_EVENT_ID and TEST_SECTION_ID accordingly.
- To reset state for tests, re-run `db/seed.sql`.
