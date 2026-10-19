# BMO Organizer PWA — AI Agent Guidelines

## 🗺️ Project Architecture
- **Tech Stack:** Vue 3 (Composition API with `<script setup lang="ts">`), TypeScript, Vite, Pinia, Tailwind CSS v4, Lucide Icons, Axios.
- **Directory Layout:**
  - `src/api/` — API client and services.
  - `src/components/` — Reusable components and layout.
  - `src/stores/` — Pinia stores (projects, calendar).
  - `src/views/` — Views (`BoardView`, `CalendarView`, `ProjectsView`).
  - `src/types/` — TypeScript interfaces.

## 🌿 Git Branching Strategy
- `feat/*` / `fix/*` -> Local features branching from `develop`.
- `develop` -> Integration branch.
- `release` -> Sandbox Deploy in Homelab (`*.bmo`).
- `main` -> Production.
- **CRITICAL:** Never commit or push directly to `main` or `release` without explicit user authorization.

## 🔑 Key Commands
- `npm run dev` — Start Vite local development server.
- `npm run build` — Run type-check with `vue-tsc` and production build.
