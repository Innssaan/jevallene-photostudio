# PhotoStudio

Platform photobox dan studio editing foto lintas platform (Web Next.js & Android Flutter) dengan backend Supabase/PostgreSQL.

## Struktur Monorepo

- `apps/web` — Aplikasi Web responsif (Next.js, React, TypeScript, Tailwind CSS)
- `apps/mobile` — Aplikasi Android (Flutter — disiapkan untuk tahap integrasi SDK Flutter)
- `packages/shared-types` — Kontrak tipe data bersama, JSON Template Engine v1, dan validator watermark **Jevallene**
- `supabase/migrations` — Skema PostgreSQL (17 entitas inti) dan kebijakan Row Level Security (RLS)
- `docs/PRD.md` — Product Requirements Document v1.0

## Menjalankan Secara Lokal

```bash
npm install
npm run typecheck
npm run test
npm run dev
```
