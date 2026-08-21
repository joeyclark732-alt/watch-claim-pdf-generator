# Claim File

Local-first watch collection documentation for insurance claims. See
`claim-file-v1-spec.md` for the full spec. No backend, no accounts —
everything lives in the browser's IndexedDB, and the only network calls in
the product are to Stripe Checkout (added in Week 4).

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

Produces a static export in `out/`. Deployed to Vercel; `vercel.json` carries
the CSP and security headers, since Next's `output: "export"` mode ignores
`next.config.ts`'s `headers()`.
