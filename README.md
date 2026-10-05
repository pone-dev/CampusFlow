# CampusFlow

CampusFlow is a role-aware university operations prototype built with React, TypeScript, and Vite. It demonstrates connected workflows for students, faculty, and administrators using fictional seeded data.

## Run locally

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build`.

## Demo accounts

- Administrator: `admin@campusflow.demo` / `admin123`
- Faculty and staff: `staff@campusflow.demo` / `staff123`
- Student: `student@campusflow.demo` / `student123`

## Demonstration workflows

- Resolve a timetable room conflict and publish an announcement.
- Advance a facilities ticket and save a class register.
- Reserve Library 2F while it is available.
- Submit an anonymous complaint with a category and urgency, then track its case reference and review status.
- Review complaints without a student name or ID in the reviewer table.

## Prototype limits

Campus records are seeded in browser memory and reset on reload. Supabase can authenticate users when configured, but the current app does not persist campus records to Supabase. Complaint submissions contain no reporter identity in the demo data, and student case tracking is kept only in the current app session. This is a UI demonstration, not production-grade anonymity or authorization; a real deployment needs server-side storage, access controls, and tested row-level security policies.

All sample people and university data are fictional. AI answers and operational actions are scripted demonstrations, not live integrations.