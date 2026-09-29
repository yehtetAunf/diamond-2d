# Diamond 2D — D1 Admin Build

Reference behavior is adapted from the supplied sample ZIP, but sample branding/data are not copied.

## Features
- Diamond 2D mobile UI
- ☰ menu and Settings open the Admin Panel
- Admin fields: 2D Result, SET, VALUE
- SAVE & PUBLISH is the only action that changes public data
- Before SAVE, the current public values remain unchanged
- D1 stores current result and history
- `/api/state` GET/POST Worker API
- Six existing Diamond 2D display slots remain configurable in the frontend

## D1
The project is bound to:
- binding: `DB`
- database: `diamond-2d-db`
- database id: `3ddcdfed-7751-4a85-8e35-6a8a67c5ea26`

If the database is new, run `schema.sql` once in the D1 console.

## Deploy
Commit/push these files to the `main` branch. Cloudflare should deploy using the existing `npx wrangler deploy` configuration.


## UI update
The public page has been redesigned to follow the supplied Monaco-style 2D layout:
Diamond 2D branding, Published status, large live result, SET/VALUE cards,
six 2D time/result cards, 2D History, and 3D Live buttons. The existing
Cloudflare Worker + D1 admin flow is retained.
