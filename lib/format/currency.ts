/**
 * `declared_value` has no currency field of its own — it implicitly shares
 * `purchase_currency`, defaulting to USD when unset. Centralized here so the
 * cover total, summary schedule, item valuation block, and list view all
 * apply the exact same convention instead of drifting apart.
 */
export function formatCurrency(
  value: number,
  currency: string | null | undefined,
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toLocaleString();
  }
}
