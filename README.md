# Diamond 2D — Admin + Cloudflare API

## What was added
- Admin Panel: 2D Result / SET / VALUE / SAVE
- Current data stays unchanged until SAVE is pressed.
- `/api/state` GET/POST Cloudflare Worker API
- History entries on SAVE
- Mobile-safe Admin Panel
- Local fallback while KV is not connected

## Cloudflare KV setup
Create a KV namespace, then replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` in `wrangler.jsonc` with its namespace ID.

For production, also add a Worker secret named `ADMIN_KEY` and send it with POST requests. The included browser panel currently demonstrates the save flow; if public admin access must be restricted, add an admin login/auth layer before exposing SAVE.

## Deploy
Cloudflare Workers:
- Build command: None
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Production branch: `main`

## Important
The included `/api/state` stores the admin state in KV. It does not yet fetch a third-party 2D API. That can be connected after the chosen provider's exact API response/authentication is confirmed.
