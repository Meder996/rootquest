# RootQuest SAT

An interactive, game-like web platform for mastering the SAT vocabulary system:
**prefixes, roots, and suffixes**. Learn with flip cards and a spaced-repetition
scheduler, test yourself in the SAT Arena, and watch your progress grow across a
personal dashboard, achievements, and streaks.

Built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and
**Tailwind CSS**. Data lives in **SQLite** (`node:sqlite`) behind a single
server-side data layer. Authentication is self-hosted: **bcryptjs** password
hashing + **jose** signed session tokens (see the architecture note below).

---

## Features

### Learning
- **Word-part library** — 130 published parts (40 prefixes, 60 roots, 30 suffixes)
  with meanings, descriptions, origins, difficulty, categories, visual mnemonics,
  and related parts. Searchable and filterable.
- **Word-part detail pages** — example words (561) with definitions and SAT-style
  example sentences, save-to-collection buttons, related parts, and a mini-check.
- **Flashcard study** — flip cards with a four-button self-rating
  (**Again / Hard / Good / Easy**) driven by a spaced-repetition algorithm
  (intervals from 10 minutes up to 180 days, per-item ease factors).
  Study scopes: *due now*, *mistakes*, *new*, *everything*.
- **Review queue** — a dedicated page for due items and past mistakes
  (the "Error Laboratory").
- **Sample lesson** — a free, no-account lesson with flip cards and a mini-check.

### Quizzes (SAT Arena)
- Multiple-choice quizzes with **instant feedback and explanations**.
- Modes: mixed, by category, by difficulty, by lesson, and *review my mistakes*.
- Optional **timed mode** (45 seconds per question), keyboard support (1–4 to
  answer, Enter to advance), and an in-quiz **report-a-question** flow.
- **Results persist after refresh** — quizzes can be exited and saved, and a
  refresh mid-quiz resumes exactly where you left off. Full per-question review
  with explanations and answer times.
- A **public demo quiz** (5 questions, no account required).

### Gamification & progress
- **XP and levels** (level = floor(XP / 500) + 1), daily goals, and streaks.
- **11 achievements** with unlock progress, shown on a dedicated page and
  celebrated inline when earned.
- **Progress page** — 14-day activity chart, mastery distribution, per-category
  accuracy, and quiz history.
- **Dashboard** — streak, daily goal, due items, weekly activity, mastery ring,
  recommended lesson, recent achievements, weakest categories, upcoming reviews.

### Accounts & auth
- Register, log in, log out, **email verification**, **password reset** flows.
- Profile settings (name, daily goal, SAT date, timezone), **change password**,
  **resend verification**, and **account deletion** (type-DELETE confirmation).
- Sessions are httpOnly, sameSite=lax cookies backed by signed JWTs; sessions are
  revoked on logout and on password change/reset.

### Admin console (`/admin`, admin role only)
- Overview stats and new-feedback inbox.
- **CRUD for word parts, example words, questions, and lessons** — including a
  lesson part manager (add/remove/reorder parts) — so content is published
  without touching the database.
- Question editor enforces exactly 4 options and exactly 1 correct answer;
  publishing re-validates the full question.
- **User management** (role changes, audited), **feedback triage**, platform
  **reports** (signups, reviews, quiz stats, top parts, mastery distribution),
  and a full **audit log** of administrative actions.

### Design & accessibility
- Dark navy theme with violet/turquoise/coral/yellow accents, plus an optional
  **light theme** (toggle in the navbar, persisted in `localStorage`).
- Rounded cards, soft gradients, animated learning path — and full
  **`prefers-reduced-motion`** support.
- Semantic HTML, visible focus rings, sufficient contrast, ARIA labels on all
  icon buttons and dialogs, keyboard-operable flashcards/quizzes.
- Fully responsive down to **320px** screens.
- **Icons (lucide-react) everywhere — no emoji.**

---

## Getting started

### Prerequisites
- Node.js **22+** (the app uses the built-in `node:sqlite` module)
- npm

### Install & run

```bash
npm install
cp .env.example .env.local   # optional — safe dev defaults are built in
npm run seed                 # create the schema + seed all content
npm run dev                  # http://localhost:3000
```

### Seed accounts

| Role    | Email                 | Password      |
|---------|-----------------------|---------------|
| Admin   | `admin@rootquest.app` | `Admin1234!`  |
| Student | `student@rootquest.app` | `Student1234!` |

### Scripts

| Command            | What it does                                             |
|--------------------|----------------------------------------------------------|
| `npm run dev`      | Start the dev server on `0.0.0.0:3000`                   |
| `npm run build`    | Production build                                         |
| `npm start`        | Serve the production build                               |
| `npm test`         | Run the full test suite (Vitest)                         |
| `npm run test:watch` | Run tests in watch mode                                |
| `npm run seed`     | (Re)create the database schema and seed all content      |
| `npm run db:reset` | Delete the SQLite file and re-seed from scratch          |
| `npm run lint`     | Next.js lint                                             |

### Environment variables

See [.env.example](.env.example). All values have safe development defaults:

- `JWT_SECRET` — **must** be a long random string in production.
- `DATABASE_PATH` — SQLite file location (default `.data/rootquest.sqlite`).
- `APP_URL` — public base URL used in links.

---

## Seeded content

`npm run seed` creates:

- **130** word parts (40 prefixes, 60 roots, 30 suffixes)
- **561** example words
- **1,392** quiz questions (all with exactly 4 options and 1 correct answer)
- **12** lessons whose rosters cover all 130 parts
- **11** achievements

---

## Architecture

```
app/                     Next.js App Router pages & API routes
  page.tsx               landing page
  about|contact|privacy|terms|lesson/sample   public pages
  auth/*                 sign-up, log-in, forgot/reset password, verify email
  dashboard              student dashboard (server component)
  learn                  word-part library + detail pages
  study/flashcards       spaced-repetition study
  quiz                   quiz setup, runner, results, public demo
  review|progress|achievements|saved|profile   student pages
  admin                  admin console (layout re-verifies admin role in the DB)
  api/                   48 route handlers (auth, public, student, admin)
components/              UI primitives, layout, landing, dashboard, flashcards,
                         quiz, admin, achievements, learn widgets
lib/
  db.ts                  single SQLite access point (node:sqlite)
  auth/                  password (bcryptjs), jwt (jose), sessions, guards, tokens
  data/                  library, learning (SRS items), dashboard, analytics
  srs/algorithm.ts       pure spaced-repetition scheduling
  quiz/scoring.ts        quiz scoring & XP
  gamification.ts        XP, streaks, achievements
  content/               all authored content (parts, words, questions, lessons)
  validation/schemas.ts  zod schemas for every API input
db/schema.sql            21 tables + indexes
middleware.ts            edge route guards (JWT only — no DB in the edge runtime)
tests/                   unit, integration (API), and component (RTL) tests
```

### Security model
- **Server-side authorization everywhere.** Middleware is a first line of
  defense (it verifies the signed session cookie only, because the edge runtime
  has no database). Every protected page and API route re-checks the session
  and role **against the database** — that is the real boundary.
- Students cannot access `/admin` (middleware redirect + layout redirect +
  `requireAdmin` on every admin API route).
- Cross-user data access is prevented server-side: every query filters by the
  session's `user_id`, and quiz results/answers are only served to the attempt
  owner (covered by integration tests).
- All API input is validated with **zod** before touching the database.
- **Rate limiting** on register, login, password reset, quiz start/answer,
  reviews, and feedback (in-memory fixed window, per IP).
- Passwords are hashed with **bcrypt**; session tokens are **HS256 JWTs**
  signed with `JWT_SECRET`; password reset / email verification tokens are
  random 32-byte values stored **sha256-hashed** with expiry.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`) are set in `next.config.mjs`.
- No service-role keys or secrets are ever exposed client-side; the profile
  API returns a sanitized user object (no password hash).

### A note on the auth provider (PRD deviation)

The PRD recommends a tested managed auth provider (Supabase). **Supabase (and
its hosted database) is not reachable from this build environment**, so
RootQuest ships a **self-hosted auth stack** with the same guarantees:
`bcryptjs` for password hashing, `jose` for signed session tokens, server-side
session rows with revocation, rate limiting, and hashed one-time tokens for
password reset / email verification. The data layer (`lib/db.ts`) is the single
database access point, so swapping in Supabase/Postgres later only requires
re-implementing that module and the auth primitives — no route handler or page
changes.

### Dev-only convenience: token disclosure

There is no mail server in this environment, so in **non-production** mode the
`forgot-password` and `resend-verification` API responses include the raw token
as `devResetToken` / `devVerificationToken`, and the corresponding pages render
a clickable dev link. In production these fields are never returned. Do not
rely on this behavior outside local development.

---

## Testing

```bash
npm test
```

- **Unit tests** — SRS algorithm, quiz scoring, zod validation, content
  integrity (counts, lesson coverage, question integrity), question generation.
- **Integration tests** — full API workflows against a real (test) database:
  register → login → session invalidation on logout, password reset, the
  public library, SRS reviews, a complete quiz flow with results, dashboard
  data, **cross-user isolation**, admin content management + audit trail.
- **Component tests** — React Testing Library tests for the flashcard and
  rating buttons (rendering, click + keyboard interaction, disabled state,
  flip/reset behavior).

---

## Deployment

```bash
JWT_SECRET=<long-random-string> npm run build
JWT_SECRET=<long-random-string> npm start   # serves on 0.0.0.0:3000
```

- The SQLite database file (`DATABASE_PATH`) must be on a **persistent volume**.
- `npm run seed` is idempotent-safe to re-run; use `npm run db:reset` to start
  from a clean database.
- Works on any Node 22 host (VPS, Railway, Fly.io, Render, etc.).

---

## Privacy & data

See [app/privacy/page.tsx](app/privacy/page.tsx) for the full policy. In short:

- RootQuest collects only what the product needs: your account details, learning
  progress, quiz history, saved words, and feedback you submit.
- Passwords are bcrypt-hashed; session tokens are signed and revocable; reset
  and verification tokens are stored hashed with expiry.
- You can **export** your data (profile, progress, quiz history, saved words)
  from the profile page area, and you can **delete your account** at any time
  from `/profile` — deletion removes your account and all associated personal
  data (progress, sessions, saved words, quiz history, achievements, feedback).
- No third-party analytics or advertising trackers are used.

---

## License

MIT
