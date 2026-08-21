export type Tier = "single" | "collection" | "unlimited";

export const TIER_LABEL: Record<Tier, string> = {
  single: "Single",
  collection: "Collection",
  unlimited: "Unlimited",
};

export const TIER_PRICE_USD: Record<Tier, number> = {
  single: 49,
  collection: 99,
  unlimited: 199,
};

/** null means no cap. Enforced at export time, not entry time, per spec. */
export const WATCH_CAP: Record<Tier, number | null> = {
  single: 3,
  collection: 12,
  unlimited: null,
};

export const TIER_RANGE_LABEL: Record<Tier, string> = {
  single: "1 to 3 watches",
  collection: "4 to 12 watches",
  unlimited: "Any number of watches",
};
