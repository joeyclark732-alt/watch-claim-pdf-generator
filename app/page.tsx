"use client";

import { useEffect, useState } from "react";
import { CollectionList } from "@/components/CollectionList";
import { LandingPage } from "@/components/LandingPage";
import { listWatches } from "@/lib/db";

export default function RootPage() {
  const [hasWatches, setHasWatches] = useState<boolean | null>(null);

  useEffect(() => {
    listWatches().then((watches) => setHasWatches(watches.length > 0));
  }, []);

  if (hasWatches === null) return null;
  return hasWatches ? <CollectionList /> : <LandingPage />;
}
