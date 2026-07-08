# KRONOS Aegis
The honest, read-only co-pilot for Base: Scan (pre-buy safety), Depth (collateral contagion), Ledger (UK CGT reconstruction), plus an Agents/MCP interface. Public data only. Not financial or tax advice.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000

## Deploy (free Vercel Hobby)
1. Push this repo to `paras-proton/kronos-aegis` (private).
2. In Vercel (Alpha-Kronos team) → New Project → import the repo. Framework: Next.js.
3. Add env vars from `.env.example` in Vercel → Settings → Environment Variables.
4. Deploy → you get `kronos-aegis.vercel.app`.

## Custom domain (kronos.online — no registrar transfer)
- Vercel → project → Domains → add `kronos.online` + `www`.
- Copy the exact DNS records Vercel shows into GoDaddy → DNS (typically A `@` 76.76.21.21 and CNAME `www` cname.vercel-dns.com — use Vercel's on-screen values). Keep the domain at GoDaddy.

## Notes
- All Scan/Depth/Ledger data is MOCK in this build (marked `source: "MOCK"`). Swap the functions in `lib/mock.ts` and `app/api/*` for BaseScan / GoPlus / DefiLlama / GBP FX. Add caching + rate limiting before production.
- Read-only: no wallet connect, no signing, no fund movement, no HMRC submission. Compliance copy: "data reconstruction, not advice."
