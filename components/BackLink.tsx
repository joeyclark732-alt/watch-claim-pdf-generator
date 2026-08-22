import Link from "next/link";

export function BackLink({
  href = "/",
  label = "Back to collection",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1 text-label text-ink-muted hover:text-ink"
    >
      <span aria-hidden>←</span> {label}
    </Link>
  );
}
