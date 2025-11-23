## Sincrolab Test Backend

NestJS + Prisma backend for managing therapists, patients and their tasks. It exposes authenticated REST APIs for:

- Auth: register/login/logout users (therapists/admins)
- Patients: CRUD operations on patients
- Tasks: CRUD operations on patient tasks

The APIs are documented with Swagger at `/api` when the app is running.

---

## Tech stack

- **Runtime:** Node.js
- **Language:** TypeScript (NestJS 11)
- **Framework:** NestJS (REST controllers + DI)
- **ORM:** Prisma
- **Database:** SQLite (or any database supported by Prisma through `DATABASE_URL`)
- **Auth:** JWT (access tokens with expiration) + bcrypt password hashing
- **Validation:** `class-validator` + `class-transformer`

---

## Getting started (backend)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

- `DATABASE_URL` – Prisma connection string (SQLite URL by default)
- `PORT` – Port where the HTTP server will listen (e.g. `3000`)
- `JWT_SECRET` – Secret key used to sign JWT access tokens
- `JWT_EXPIRES_IN` – Access token TTL, e.g. `3600s` or `1h`

### 3. Run database migrations

```bash
pnpm prisma migrate dev
```

For production you can use:

```bash
pnpm prisma migrate deploy
```

### 4. Start the backend

```bash
# development (watch mode)
pnpm dev

# production build
pnpm build
pnpm start:prod
```

The server will start on `http://localhost:<PORT>`.

Swagger UI is available at:

- `http://localhost:<PORT>/api`

---

## Environment variables

See `.env.example` for all keys. Main values:

- `DATABASE_URL` – Prisma database connection string
- `PORT` – HTTP port
- `JWT_SECRET` – secret used to sign JWT access tokens
- `JWT_EXPIRES_IN` – access token expiry (e.g. `3600s`)

---

## Database schema

Prisma models (see `prisma/schema.prisma`):

- **User**
  - `id` (UUID)
  - `email` (unique)
  - `password` (bcrypt-hashed)
  - `role` (`admin` | `therapist`)
  - timestamps

- **Patient**
  - `id` (UUID)
  - `fullName`
  - timestamps
  - relation: `tasks` – one patient has many tasks

- **Task**
  - `id` (UUID)
  - `title`, optional `description`
  - `status` (`pending` | `in_progress` | `done`)
  - optional `dueDate`
  - timestamps
  - `patientId` – foreign key to `Patient`

---

## API overview

The full, up‑to‑date API documentation is available via Swagger at `/api`. High-level routes:

- **Auth**
  - `POST /auth/register` – register a new user (email + password)
  - `POST /auth/login` – login with email/password, returns JWT
  - `GET /auth/logout` – revoke current access token

- **Patients**
  - `POST /patient` – create patient
  - `GET /patient` – list patients (with pagination)
  - `GET /patient/:id` – get patient by id
  - `PATCH /patient/:id` – update patient
  - `DELETE /patient/:id` – delete patient

- **Tasks**
  - `POST /patient/:id/tasks` – create a task for a patient
  - `GET /patient/:id/tasks` – list tasks for a patient (with pagination)
  - `GET /tasks/:id` – get a single task
  - `PATCH /tasks/:id` – update a task
  - `DELETE /tasks/:id` – delete a task

All non‑public routes are protected by JWT via a global auth guard.

---

## Testing

Run the automated test suite with:

```bash
pnpm test

# e2e tests
pnpm test:e2e

# coverage
pnpm test:cov
```

Tests cover happy paths (auth, patient/task creation) and validation/error scenarios.

---

## Assumptions & limitations

- Single JWT access token type (no refresh tokens).
- In‑memory token revocation list (non‑persistent, resets between restarts).
- Simple role model (`admin` and `therapist`) without fine‑grained permissions.
- Pagination is basic page/limit style and not optimized for very large datasets.
- Database defaults to SQLite for ease of local development.

---

## Future improvements

- Add refresh tokens and proper token blacklisting (e.g. Redis).
- Add richer role‑based access control (RBAC) for different user roles.
- Improve pagination (cursor‑based, stable ordering) and filtering/search.
- Add more comprehensive tests (unit + e2e, edge cases, performance).
- Add request logging, metrics and better observability.
- Add a production‑ready deployment guide and CI pipeline examples.
