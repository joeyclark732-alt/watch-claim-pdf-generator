# Claim File: v1 Specification (local-first)

Watch collectors build an insurer-ready documentation package. **The app stores nothing.** All data lives on the user's device; the PDF is generated in the browser; the server never sees a watch, a photo, or a serial number.

Scope target: ~30 working hours across four weeks.

---

## 1. Why local-first

Three reasons, in order of importance.

1. **It's the product's best marketing claim.** The buyer is someone worried about being targeted for owning valuables. A tool that promises to catalogue those valuables in someone else's database is fighting its own pitch. "Your data never leaves your device" answers the exact anxiety that brings them here.
2. **It removes the threat model.** No database linking wealthy people to portable goods and home addresses. Nothing to breach, nothing to subpoena, nothing to leak.
3. **It halves the build.** No auth, no RLS, no storage buckets, no signed URLs, no backups, no data-deletion requests.

The cost is the subscription. Accept it. The natural cadence for this task is annual, and a subscription attached to a once-a-year action was always going to retain badly.

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js, statically exported | No server rendering of user data, because there is none |
| Local persistence | IndexedDB via `idb` | Survives refresh and browser restart |
| Image handling | Canvas re-encode | Strips EXIF and resizes in one step |
| PDF | `pdf-lib` | Full layout control, embeds JPEGs without rasterizing text |
| Encryption | WebCrypto, AES-GCM, PBKDF2 | For the portable backup file |
| Payments | Stripe Checkout, hosted | Only server interaction in the product |
| Licensing | Ed25519 signed keys, verified offline | No license database |
| Hosting | Any static host | Vercel, Netlify, Cloudflare Pages all fine |

There is no backend database. There is no user account.

---

## 3. Data model (IndexedDB object stores)

Same shape as a server schema, stored locally.

### `profile` (single record)
`full_legal_name`, `mailing_address`, `insurer_name`, `policy_number`

### `watches`
`id`, `brand`, `model_name`, `reference_number`, `serial_number`, `case_material`, `case_diameter_mm`, `lug_width_mm`, `movement_type`, `complications[]`, `strap_type`, `purchase_date`, `purchase_price`, `purchase_currency`, `purchase_source`, `declared_value`, `declared_value_date`, `valuation_basis` (`receipt` | `appraisal` | `owner_estimate`), `condition_notes`, `has_box`, `has_papers`, `has_extra_links`, `status`, `created_at`, `updated_at`

No market value field exists anywhere. Values are owner-declared, sourced from the user's own receipt or a third-party appraisal.

### `documents`
`id`, `watch_id`, `doc_type` (`receipt` | `warranty_card` | `appraisal` | `service_record` | `authentication` | `policy_document` | `other`), `blob`, `file_name`, `mime_type`, `issued_date`, `issuer_name`, `notes`

### `photos`
`id`, `watch_id`, `shot_type` (`dial` | `caseback` | `serial_macro` | `clasp` | `side_profile` | `movement` | `box_papers` | `on_wrist`), `blob_full`, `blob_thumb`, `taken_at`

`shot_type` drives the guided checklist. The UI asks for one named shot at a time. This is why people end up with a serial macro instead of nine wrist shots.

---

## 4. Image pipeline

Every image goes through this on import, before it touches IndexedDB:

1. Read via File API
2. Draw to canvas and re-encode as JPEG. **This is what strips EXIF**, including GPS coordinates recorded at the user's home.
3. Produce a full version capped at 2400px on the long edge, quality 0.85
4. Produce a thumbnail at 400px
5. Store both blobs, discard the original

The original file object is never persisted. Re-encoding, not tag-deletion, is the mechanism, because it cannot miss a vendor-specific metadata block.

---

## 5. Completeness score

Per watch, out of 100, rendered live as items are edited. This is the engagement engine, so it appears the moment a watch is created and updates as gaps close.

| Component | Points |
|---|---|
| Serial number recorded | 15 |
| Reference number recorded | 10 |
| Proof of value attached (receipt or appraisal) | 20 |
| Appraisal dated within last 24 months | 15 |
| Serial macro photo | 10 |
| Dial photo | 5 |
| Caseback photo | 5 |
| Clasp or bracelet photo | 5 |
| Side profile photo | 5 |
| Box and papers status recorded | 5 |
| Condition notes present | 5 |

Collection score is declared-value-weighted, not a flat average. A complete record on a $400 Seiko should not paper over a bare entry on a $30k Daytona.

Every gap renders as a specific instruction with its point value: "Add a macro photo of the caseback serial: +10". Never a vague completeness nag.

---

## 6. PDF layout

The artifact is the product. Everything upstream is data entry in service of it.

**Cover**
Title, owner legal name and address, insurer and policy number when present, date generated, item count, total declared value. Footer disclaimer: values are owner-declared and sourced from attached receipts or third-party appraisals; this document is not an appraisal.

**Summary schedule**
One table an adjuster reads in a single pass: index, brand, model, reference, serial, declared value, basis, valuation date.

**Item pages, one per watch**
Header with brand, model, reference. Identification block. Provenance block. Valuation block. Condition notes. Six-photo grid, two rows of three, captioned by shot type. Attached document list with type and issued date.

**Appendix**
Full-page reproductions of every attached document, ordered by item.

**Global footer**
Generated date, page X of Y, owner name. These get filed and separated, so every page must stand alone.

---

## 7. Portable backup

The re-entry problem is real: nobody wants to retype a collection next year. Solution without a server:

- **Export** produces a single `.claimfile` bundle containing all records and image blobs, encrypted with AES-GCM under a key derived from a user passphrase via PBKDF2.
- **Import** restores it on any device.
- Prompt for export after any meaningful edit session, and tell the user plainly to store it somewhere other than the machine holding the watches.

Encryption here is not ceremony. The bundle is exactly the document a burglar would want, and users will put it in cloud storage.

---

## 8. Pricing and licensing

### Tiers

| Tier | Watches | Price (one-time) |
|---|---|---|
| Free | Unlimited entry, preview only | $0 |
| Single | 1 to 3 | $49 |
| Collection | 4 to 12 | $99 |
| Unlimited | Any | $199 |

### The free tier is deliberately generous

Free users can enter **unlimited** watches, upload every document, take every photo, and see their completeness scores. Nothing about data entry is gated.

The paywall sits at one place only: producing the real PDF.

This is the design's most important decision. The product's conversion moment is sunk effort. Someone who has spent an hour photographing six watches and watched their scores climb from 20 to 95 is a fundamentally different prospect from someone evaluating a landing page. Let them do all the work first.

### The preview must not be a PDF

Do not generate the document and then attempt to block printing. Browser print blocking is trivially defeated and is wasted effort.

Instead: render the preview as **watermarked canvas images**, produced by the same layout engine that generates the real document. The PDF is never created until a valid license is present. The artifact does not exist to be captured. This is both unbypassable and less work than the alternative.

The preview shows every page at full fidelity. Users should see exactly what they're buying, watermarked.

### Licensing mechanics

Stripe Checkout, one product with three prices. On payment, a webhook signs a license key (Ed25519 over the buyer's email, tier, and purchase ID) and emails it. The app embeds the public key and verifies offline. No license database, no accounts, no server state.

The signed payload carries the tier, and the app enforces the watch cap at export time, not at entry time.

**Upgrades:** keys are immutable, so an upgrade issues a replacement key. Build the app to accept a superseding key from day one. Retrofitting this later is painful.

**Enforcement is honor-system.** Offline verification in a local-first app is bypassable by anyone who opens devtools. This is an accepted trade, not an oversight. A collector worried enough about claim documentation to find this tool is not the person cracking a $49 app.

### The math

Blended revenue lands near $80 per buyer on a plausible collection-size distribution, requiring roughly 130 to 320 sales a year to reach $200 to $500 a week. More units than a flat $99 would need, against a substantially larger addressable market: there are far more people with one $15k watch than with a twenty-piece collection, and their exposure per item is identical.

Revisit the tier thresholds after thirty sales, when the actual distribution is visible rather than assumed.

---

## 9. Security requirements

Shorter than the server version, and every item still matters.

1. **EXIF stripping via canvas re-encode on every image.** The single highest-consequence requirement in this app.
2. **CSP with `connect-src` restricted to Stripe only.** This makes the privacy claim verifiable rather than promised. A user can open devtools and confirm the app cannot phone home. Say so on the landing page.
3. **No analytics that touch user content.** Page-level analytics at most, nothing that observes entered data. Ideally none.
4. **Verify Stripe webhook signatures.** Idempotent handlers.
5. **Never log user data anywhere,** including console in production builds.
6. **Warn that IndexedDB is unencrypted at rest** on a shared or stolen device, and offer an optional passphrase lock over the local store.
7. **Standard headers:** HSTS, X-Content-Type-Options, Referrer-Policy.
8. **Secrets only in the webhook function's environment.** The client bundle contains the license public key and nothing else sensitive.

---

## 10. Out of scope

Market valuations or price lookups of any kind. Cloud sync. Accounts. Reminder emails. Mobile app. Sharing or public profiles. Multi-category support. Marketplace or dealer features.

Cloud sync is the one users will ask for. Don't build it until enough of them ask, and if you do, build it encrypted client-side so you still can't read it.

---

## 11. Four-week sequence

| Week | Deliverable |
|---|---|
| 1 | Static app deployed, IndexedDB layer, watch CRUD, list view |
| 2 | Image pipeline with EXIF stripping, guided photo checklist, document attachment |
| 3 | Completeness scoring, layout engine, watermarked canvas preview, encrypted export and import |
| 4 | PDF generation behind license check, Stripe checkout with three prices, license verification, landing page |

If a week slips, cut a field, not a week.
