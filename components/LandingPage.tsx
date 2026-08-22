import Link from "next/link";
import { TIER_LABEL, TIER_PRICE_USD, TIER_RANGE_LABEL, WATCH_CAP, type Tier } from "@/lib/license/tiers";
import { WatchIcon } from "./WatchIcon";

const sectionHeading =
  "text-xs uppercase tracking-widest text-ink-muted border-b border-rule pb-2 mb-6";

const cornerTick = "absolute font-mono text-xs text-ink-muted";

const tag =
  "inline-flex w-fit items-center border border-rule bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted";

function ChecklistVisual() {
  const slots = [
    { label: "Dial", filled: true },
    { label: "Caseback", filled: true },
    { label: "Serial macro", filled: false },
    { label: "Clasp", filled: true },
    { label: "Side profile", filled: false },
    { label: "Movement", filled: false },
  ];
  return (
    <div className="grid w-full max-w-xs grid-cols-3 gap-2">
      {slots.map((s) => (
        <div key={s.label} className="border border-rule bg-paper p-2 text-center">
          <div
            className={`mb-1.5 flex h-10 items-center justify-center ${
              s.filled ? "bg-ink-muted/25" : "border border-dashed border-rule"
            }`}
          >
            {!s.filled && <span className="text-ink-muted">+</span>}
          </div>
          <p className="font-mono text-[8px] uppercase tracking-wide text-ink-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function NetworkVisual() {
  const rows = [
    { path: "/_next/static/chunks/…", status: "self" },
    { path: "/fonts/Geist-Regular.ttf", status: "self" },
    { path: "checkout.stripe.com", status: "only external call" },
  ];
  return (
    <div className="w-full max-w-sm border border-rule bg-paper">
      <div className="border-b border-rule bg-paper-sunk px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Network
      </div>
      <div className="flex flex-col divide-y divide-rule font-mono text-[10px]">
        {rows.map((r) => (
          <div key={r.path} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="truncate text-ink-body">{r.path}</span>
            <span className="shrink-0 text-ink-muted">{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreVisual() {
  const gaps = [
    { label: "Add a caseback photo", points: 5 },
    { label: "Attach a receipt or appraisal", points: 20 },
  ];
  return (
    <div className="w-full max-w-sm border border-rule bg-paper">
      <div className="flex items-center justify-between border-b border-rule bg-paper-sunk px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Completeness
        </span>
        <span className="font-mono text-lg font-semibold text-oxblood">87/100</span>
      </div>
      <div className="flex flex-col divide-y divide-rule text-xs">
        {gaps.map((g) => (
          <div key={g.label} className="flex items-center justify-between px-3 py-2.5">
            <span>{g.label}</span>
            <span className="font-mono text-ink-muted">+{g.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureRow({
  tagLabel,
  title,
  subtitle,
  body,
  visual,
}: {
  tagLabel: string;
  title: string;
  subtitle: string;
  body: string;
  visual: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 border border-rule bg-paper md:grid-cols-2">
      <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
        <span className={tag}>{tagLabel}</span>
        <div>
          <h3 className="text-xl font-semibold leading-snug">{title}</h3>
          <p className="text-xl font-semibold leading-snug text-ink-muted">{subtitle}</p>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-body">{body}</p>
      </div>
      <div className="flex min-h-[220px] items-center justify-center border-t border-rule bg-paper-sunk p-8 md:border-l md:border-t-0 md:p-10">
        {visual}
      </div>
    </div>
  );
}

const TIER_ORDER: Tier[] = ["single", "collection", "unlimited"];

function PricingCard({
  name,
  descriptor,
  price,
  isFree,
  extraFeature,
}: {
  name: string;
  descriptor: string;
  price: string;
  isFree: boolean;
  extraFeature?: string;
}) {
  const baseFeatures = [
    "Unlimited watch entry",
    "Guided photo checklist",
    "Completeness scoring",
    "Encrypted local backup",
  ];

  return (
    <div className="flex flex-col border border-rule bg-paper p-6">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-xs text-ink-muted">{descriptor}</p>
      <p className="mt-4 font-mono text-3xl font-semibold">
        {price}
        {!isFree && (
          <span className="ml-1.5 text-xs font-normal text-ink-muted">one-time</span>
        )}
      </p>
      <div className="mt-4">
        {isFree ? (
          <Link
            href="/watches/new"
            className="block border border-oxblood bg-oxblood px-4 py-2 text-center text-sm font-medium text-paper transition hover:opacity-90"
          >
            Start free
          </Link>
        ) : (
          <div className="border border-dashed border-rule px-4 py-2 text-center text-xs uppercase tracking-widest text-ink-muted">
            Checkout coming soon
          </div>
        )}
      </div>
      <ul className="mt-6 flex flex-col gap-2.5 border-t border-rule pt-6 text-xs">
        {isFree ? (
          <>
            {baseFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-ink-muted">✓</span>
                <span>{f}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-ink-muted">
              <span>–</span>
              <span>Watermarked preview only</span>
            </li>
          </>
        ) : (
          <>
            <li className="text-ink-muted">Everything in Free, plus:</li>
            <li className="flex items-start gap-2">
              <span className="text-ink-muted">✓</span>
              <span>Real, unwatermarked PDF export</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ink-muted">✓</span>
              <span>{extraFeature}</span>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

function DocumentMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Background card: an abstracted skeleton of the exported cover page —
          not real content, just enough shape to read as "a document." */}
      <div className="border border-rule bg-paper p-6 shadow-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          WatchClaim
        </p>
        <div className="mt-3 h-4 w-3/4 bg-paper-sunk" />
        <div className="mt-6 flex flex-col gap-2">
          <div className="h-2 w-1/2 bg-paper-sunk" />
          <div className="h-2 w-1/3 bg-paper-sunk" />
        </div>
        <div className="mt-6 flex flex-col gap-2.5 border-t border-rule pt-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-2 w-[15%] bg-paper-sunk" />
              <div className="h-2 w-1/4 bg-paper-sunk" />
              <div className="h-2 w-[15%] bg-paper-sunk" />
              <div className="h-2 flex-1 bg-paper-sunk" />
            </div>
          ))}
        </div>
      </div>

      {/* Floating card: the completeness figure — the one place besides the
          primary button and the appendix rule where oxblood is sanctioned. */}
      <div className="absolute -bottom-7 -left-6 w-40 border border-rule bg-paper p-4 shadow-md sm:-left-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Completeness
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold text-oxblood">94/100</p>
        <div className="mt-2 h-1.5 w-full bg-paper-sunk">
          <div className="h-1.5 w-[94%] bg-oxblood" />
        </div>
      </div>

      {/* Floating card: collection summary, deliberately neutral (not oxblood) */}
      <div className="absolute -top-6 -right-4 flex items-center gap-3 border border-rule bg-paper p-3 shadow-md sm:-right-8">
        <WatchIcon className="h-9 w-9 shrink-0 text-ink" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Collection
          </p>
          <p className="font-mono text-sm font-semibold">12 watches</p>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="dot-grid relative overflow-hidden border-b border-rule">
        <WatchIcon className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] text-ink opacity-[0.035]" />
        <span className={`${cornerTick} left-4 top-4`}>+</span>
        <span className={`${cornerTick} right-4 top-4`}>+</span>
        <span className={`${cornerTick} bottom-4 left-4`}>+</span>
        <span className={`${cornerTick} bottom-4 right-4`}>+</span>

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-muted">WatchClaim</p>
            <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Insurance-ready watch documentation that never leaves your device.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-ink-muted">
              Enter your collection, photograph it against a guided checklist,
              attach receipts and appraisals, and export a claim file an
              adjuster can act on — all stored only in this browser. No
              accounts, no database, nothing uploaded, ever.
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
          </div>

          <div className="pt-6 sm:pt-0">
            <DocumentMockup />
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <FeatureRow
          tagLabel="Guided checklist"
          title="One named shot at a time,"
          subtitle="not nine wrist shots"
          body="The app asks for exactly one shot at a time — dial, caseback, serial macro, clasp — so you end up with the photos an adjuster actually needs, not a phone full of pictures of the same angle."
          visual={<ChecklistVisual />}
        />
        <FeatureRow
          tagLabel="Verifiable, not promised"
          title="Nothing leaves this device,"
          subtitle="except a Stripe checkout"
          body="This app's Content Security Policy restricts every outbound call to Stripe, and only Stripe. Open your browser's devtools and check the Network tab yourself — it isn't a claim you have to take on faith."
          visual={<NetworkVisual />}
        />
        <FeatureRow
          tagLabel="Completeness score"
          title="Every gap, named —"
          subtitle="with exactly what it's worth"
          body="No vague nagging. Each unscored item shows a specific instruction and its point value, so you always know exactly what closes the gap between a bare entry and a complete one."
          visual={<ScoreVisual />}
        />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-16 px-6 pb-16">
        <section>
          <h2 className={sectionHeading}>No valuations</h2>
          <p className="max-w-xl text-sm leading-relaxed">
            Declared values are yours, sourced from your own receipt or a
            third-party appraisal. This app never estimates or looks up
            market value — the exported document says so on its cover page.
          </p>
        </section>
      </div>

      <div className="border-t border-rule py-16">
        <div className="mx-auto w-full max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">Built to be paid for once</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-muted">
            Free to enter your entire collection, take every photo, and see
            your completeness scores. The only thing gated is exporting the
            real, unwatermarked PDF.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PricingCard name="Free" descriptor="Preview only" price="$0" isFree />
            {TIER_ORDER.map((tier) => (
              <PricingCard
                key={tier}
                name={TIER_LABEL[tier]}
                descriptor={TIER_RANGE_LABEL[tier]}
                price={`$${TIER_PRICE_USD[tier]}`}
                isFree={false}
                extraFeature={
                  WATCH_CAP[tier] === null
                    ? "Any number of watches"
                    : `Up to ${WATCH_CAP[tier]} watches`
                }
              />
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">
            Purchasing isn&apos;t live yet — checkout is coming soon. Already
            licensed?{" "}
            <Link href="/license" className="underline underline-offset-2">
              Enter your key
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
