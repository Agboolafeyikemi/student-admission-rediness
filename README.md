# Admissions Readiness Dashboard

A full-stack app that helps students understand what they're missing for grad/law/business school applications, track due dates, and monitor their readiness in real time.

## Stack

| Layer | Tech |
|-------|------|
| API | Node.js · TypeScript · Express 5 · Zod · date-fns |
| UI | Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS |
| Tests | Vitest · Supertest (API); Vitest · Vue Test Utils (UI) |

## Prerequisites

- Node.js 18+
- npm 9+

## Setup & Run

### 1. API (port 3001)

```bash
cd apps/api
npm install
npm run dev
```

### 2. Frontend (port 3000)

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Run Tests

```bash
# API unit + integration tests
cd apps/api
npm test

# Watch mode
npm run test:watch
```

## Full User Flow

1. **Onboarding** — Fill in your profile (name, email, GPA, test scores, target term) and select a target program.
2. **Dashboard** — View your readiness score, checklist grouped by category, and missing requirements.
3. **Interact** — Mark checklist items complete; the readiness score and timeline update immediately.
4. **Timeline** — See all milestones ordered chronologically with urgency indicators.
5. **Programs** — Browse and filter all programs; view requirements before selecting.
6. **Profile** — Edit your academic info and test scores at any time.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/programs` | List programs with filters (`university`, `degreeType`) and pagination (`page`, `limit`) |
| GET | `/programs/:id` | Program detail + requirements |
| POST | `/profiles` | Create student profile (idempotent by email) |
| PATCH | `/profiles/:id` | Update profile fields |
| POST | `/checklists` | Generate checklist for profile+program with computed due dates |
| PATCH | `/checklists/item` | Update checklist item status/notes |
| GET | `/readiness` | Readiness score, missing requirements, next milestones |
| GET | `/timeline` | Chronological timeline events |


## Tradeoff

### In-memory store vs. a real database
**Tradeoff:** Data resets on server restart. Profiles and checklists live in plain arrays in memory — easy to set up, deterministic for testing.
**Would change:** Switch to SQLite (via Drizzle ORM) or Postgres. The service layer is already abstracted enough that swapping data sources would not touch controllers or routes.

### Static mock data vs. seeded DB
**Tradeoff:** 5 programs and 38 requirements are hardcoded in `src/data/`. No migrations, no seed scripts, instant startup.
**Would change:** Replace with a database-backed seed that can be reset per test run. Enables adding programs through an admin UI.


### Composable-based state (no Pinia)
**Tradeoff:** Nuxt's built-in `useState` + composables work well at this scale, but cross-page state sharing becomes fragile as the app grows.
**Would change:** Introduce Pinia with typed stores for profile, checklist, and readiness state, enabling optimistic updates.

### No file upload / evidence submission
**Tradeoff:** The checklist UI has an "Upload evidence" button stub but no backend handler.
**Would change:** Add a `POST /profiles/:id/evidence` multipart endpoint backed by local storage (dev) or S3 (prod), and wire the frontend file picker to it.

### Single program per session
**Tradeoff:** The data model supports `selectedProgramIds[]`, but the UI only activates one program at a time.
**Would change:** Build a program comparison view that shows readiness scores side-by-side across selected programs.

### No request logging or tracing
**Would add:** `morgan` for HTTP logging in development, a correlation ID middleware for production tracing.

### Test coverage
**Tradeoff:** Integration and unit tests cover the core flow (checklist creation → readiness → timeline sync) but miss validators and some edge cases in profile/program services.
**Would add:** Full validator tests with Zod, property-based tests for the readiness score formula, and Playwright E2E tests for the onboarding flow.
