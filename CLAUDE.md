# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next/core-web-vitals`)

There is no test suite configured in this project.

## Architecture

This is a Next.js 16 (App Router) app demonstrating cookie-based session authentication with **Lucia v3**, backed by a local **SQLite** database via `better-sqlite3`.

### Database (`lib/db.js`)

- Single `better-sqlite3` connection opened against `training.db` in the repo root, exported as a module-level singleton (`db`).
- On import, it runs `CREATE TABLE IF NOT EXISTS` for `users`, `sessions`, and `trainings`, and seeds `trainings` once if empty. There is no separate migration step or ORM — schema changes are made directly in this file.
- All other `lib/*.js` modules import this singleton and issue raw SQL via `db.prepare(...)`.

### Auth flow

- **`lib/hash.js`** — password hashing is hand-rolled with Node's `crypto.scryptSync` + a random salt (stored as `hash:salt`), and verified with `crypto.timingSafeEqual`. Lucia is not used for password hashing, only for session management.
- **`lib/user.js`** — raw SQL access to the `users` table (`createUser`, `getUserByEmail`).
- **`lib/auth.js`** — wraps Lucia (`BetterSqlite3Adapter` over the `users`/`sessions` tables) and exposes three functions used everywhere else in the app instead of touching Lucia directly:
  - `createAuthSession(userId)` — creates a Lucia session and sets the session cookie.
  - `verifayAuth()` *(name intentionally matches the rest of the codebase — do not "fix" the typo without updating both call sites)* — reads the session cookie, validates it via Lucia, transparently refreshes/blanks the cookie as needed, and returns `{ user, session }`.
  - `destroySession()` — invalidates the current session and blanks the cookie.
- **`actions/auth-actions.js`** (`"use server"`) — the only place form submissions are handled:
  - `signup` / `login` do manual field validation (returned as `{ errors: {...} }` for `useActionState`), then call into `lib/hash.js`, `lib/user.js`, and `lib/auth.js`, and `redirect("/training")` on success.
  - `auth(mode, prevState, formData)` is a dispatcher used as the actual server action — it's bound with `mode` ("login" | "signup") via `.bind(null, mode)` on the client.
  - `logout()` destroys the session and redirects to `/`.

### Route structure

- `app/page.js` — the single auth entry point. It reads `?mode=login|signup` from the URL search params (defaulting to `login`) and renders `<AuthForm mode={...} />`. Login/signup are **not** separate routes; switching modes is done via `Link href="/?mode=signup"` etc. inside `AuthForm`.
- `components/auth-form.js` (`"use client"`) — one form used for both modes, driven by `useActionState(auth.bind(null, mode), ...)`.
- `app/(auth)/` — route group for authenticated pages. `app/(auth)/layout.js` renders a shared header with a logout form (`action={logout}`) and wraps its own `globals.css` import; `app/(auth)/training/page.js` calls `verifayAuth()` directly and `redirect("/")` if there's no `user`, then renders training sessions from `lib/training.js`. There is no shared middleware for auth — each protected page does its own `verifayAuth()` check.

### Path aliases

`@/*` maps to the repo root (`jsconfig.json`), e.g. `@/lib/auth`, `@/components/auth-form`.

## Notes

- `training.db` is a real SQLite file checked into the working tree (not `.gitignore`d) and gets mutated by running the app locally — be aware `git status` may show it as modified during normal dev/testing.
- `.agents/skills/better-auth-best-practices/` documents the **Better Auth** library, which this project does **not** use (this project uses **Lucia**). Ignore that skill's guidance when working in this repo.