import Link from "next/link";
import { TIER_LABEL, TIER_PRICE_USD, TIER_RANGE_LABEL } from "@/lib/license/tiers";

const sectionHeading =
  "text-xs uppercase tracking-widest text-ink-muted border-b border-rule pb-2 mb-6";

export function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-16">
      <section className="border-b border-rule pb-12">
        <p className="text-xs uppercase tracking-widest text-ink-muted">WatchClaim</p>
        <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight">
          Insurance-ready watch documentation that never leaves your device.
        </h1>
        <p className="mt-4 max-w-lg text-sm text-ink-muted">
          Enter your collection, photograph it against a guided checklist,
          attach receipts and appraisals, and export a claim file an adjuster
          can act on — all stored only in this browser. No accounts, no
          database, nothing uploaded, ever.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link
            href="/watches/new"
            className="border border-oxblood bg-oxblood px-5 py-2.5 text-sm font-medium text-paper transition hover:opacity-90"
          >
            Start documenting your collection
          </Link>
          <Link
            href="/license"
            className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Already have a license?
          </Link>
          <Link
            href="/backup"
            className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Restoring from a backup?
          </Link>
        </div>
      </section>

      <section>
        <h2 className={sectionHeading}>Why local-first</h2>
        <p className="max-w-xl text-sm leading-relaxed">
          A tool that catalogues your valuables into someone else&apos;s
          database is fighting its own pitch. So this one doesn&apos;t: there
          is no server holding a list of what you own and where you live.
          Nothing to breach, nothing to subpoena, nothing to leak, because
          there is nothing to leak from — every watch, photo, and document
          stays in this browser&apos;s local storage on this device.
        </p>
      </section>

      <section>
        <h2 className={sectionHeading}>Verifiable, not promised</h2>
        <p className="max-w-xl text-sm leading-relaxed">
          Don&apos;t take that on faith. This app&apos;s Content Security
          Policy restricts every outbound network call to Stripe, and only
          Stripe — open your browser&apos;s devtools, watch the Network tab,
          and confirm it yourself. Every photo is re-encoded through a canvas
          before it&apos;s stored, which strips EXIF metadata including the
          GPS coordinates a phone photo taken at home would otherwise carry.
        </p>
      </section>

      <section>
        <h2 className={sectionHeading}>How it works</h2>
        <ol className="flex max-w-xl flex-col gap-3 text-sm leading-relaxed">
          <li>
            <span className="font-mono text-ink-muted">01</span> Enter each
            watch&apos;s identification, provenance, and valuation details.
          </li>
          <li>
            <span className="font-mono text-ink-muted">02</span> Follow the
            guided photo checklist — one named shot at a time, so you end up
            with a serial macro instead of nine wrist shots.
          </li>
          <li>
            <span className="font-mono text-ink-muted">03</span> Attach
            receipts, appraisals, and service records.
          </li>
          <li>
            <span className="font-mono text-ink-muted">04</span> Watch your
            completeness score climb as the gaps close.
          </li>
          <li>
            <span className="font-mono text-ink-muted">05</span> Export a
            document an adjuster can act on.
          </li>
        </ol>
      </section>

      <section>
        <h2 className={sectionHeading}>No valuations</h2>
        <p className="max-w-xl text-sm leading-relaxed">
          Declared values are yours, sourced from your own receipt or a
          third-party appraisal. This app never estimates or looks up market
          value — the exported document says so on its cover page.
        </p>
      </section>

      <section>
        <h2 className={sectionHeading}>Pricing</h2>
        <p className="mb-4 max-w-xl text-sm text-ink-muted">
          Free to enter your entire collection, take every photo, and see
          your completeness scores. The only thing gated is exporting the
          real, unwatermarked PDF.
        </p>
        <div className="border border-rule">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-rule bg-paper-sunk text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-2 font-medium">Tier</th>
                <th className="px-3 py-2 font-medium">Covers</th>
                <th className="px-3 py-2 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-rule">
                <td className="px-3 py-2">Free</td>
                <td className="px-3 py-2 text-ink-muted">
                  Unlimited entry, watermarked preview
                </td>
                <td className="px-3 py-2 text-right font-mono">$0</td>
              </tr>
              {(["single", "collection", "unlimited"] as const).map((tier) => (
                <tr key={tier} className="border-b border-rule last:border-b-0">
                  <td className="px-3 py-2">{TIER_LABEL[tier]}</td>
                  <td className="px-3 py-2 text-ink-muted">{TIER_RANGE_LABEL[tier]}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    ${TIER_PRICE_USD[tier]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink-muted">
          Purchasing isn&apos;t live yet — checkout is coming soon. Already
          licensed?{" "}
          <Link href="/license" className="underline underline-offset-2">
            Enter your key
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
