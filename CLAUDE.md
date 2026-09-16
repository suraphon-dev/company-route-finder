# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository currently contains only `IMPLEMENTATION_PLAN.md` — no code has been written yet. That file is the authoritative spec and build checklist for this project; read it in full before starting any work, and follow its phases in order (Phase 0 → 7). Update the checkboxes in `IMPLEMENTATION_PLAN.md` as phases/tasks are completed.

## What this project is

A web app with separate Backend/Frontend that shows the driving route and traffic-aware distance/time from the user's current location to the company's location, rendered on Google Maps.

- Backend: Node.js + Express, calls Google Directions API (server-side only)
- Frontend: Nuxt 4 (Vue 3), renders Google Maps JavaScript API, calls the backend for directions
- Tests: Jest/Vitest + Supertest (backend), Vitest + @nuxt/test-utils (frontend)
- Deploy target: Backend → Render/Railway, Frontend → Vercel

Expected structure once scaffolded (per the plan):
```
backend/src/{services/googleMaps.js, routes/directions.js, app.js, server.js}
backend/tests/
frontend/app/components/MapView.vue
frontend/tests/
```
`app.js` exports the Express app instance separately from `server.js` (which calls `listen()`) so tests can exercise routes without opening a real port.

## Critical rule: API key handling

This project uses **two separate Google Maps API keys** — never conflate them:

1. **Browser key** (`NUXT_PUBLIC_GOOGLE_MAPS_KEY`, in `frontend/.env`) — Maps JavaScript API only, restricted by HTTP referrer. It is intentionally bundled into client JS; that is not a leak.
2. **Server key** (`GOOGLE_MAPS_SERVER_KEY`, in `backend/.env`) — Directions API + Geocoding API, restricted by IP. Must never be exposed via any endpoint or logged.

**`.gitignore` must include `.env`/`.env.*.local` before any real `.env` file is ever created.** Before every commit, verify `.env` is not staged (`git status`) and never has been (`git log --all --full-history -- .env`). `.env.example` files should list variable names only, never real values.

The frontend must never call the Google Directions API directly — all directions requests go through the backend, which is the only place the server key is used.

## Commands

No code/tooling exists yet, so there are no working build/lint/test commands to reference. Once scaffolded per the plan:
- Backend: `npm test` inside `backend/` (Jest/Vitest + Supertest, mocking outbound Google API calls — never hit Google during tests)
- Frontend: `npm test` inside `frontend/` (Vitest + @nuxt/test-utils, mocking `$fetch` and `navigator.geolocation`)

Run `npm test` in the relevant workspace and ensure it passes before moving to the next implementation phase.
