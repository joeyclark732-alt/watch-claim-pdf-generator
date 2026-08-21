import { getProfile, listAllDocuments, listAllPhotos, listWatches } from "@/lib/db";
import { renderAppendix } from "./appendixPage";
import { renderCoverPage } from "./coverPage";
import { drawFooter } from "./footer";
import { renderItemPage } from "./itemPage";
import type { PageRenderer } from "./renderer";
import { renderSummarySchedule } from "./summaryPage";

/**
 * Only status === "owned" watches appear anywhere in the report — matches
 * the list view's default filter and 3a's collection-score scope. A
 * sold/lost watch isn't part of a live claim.
 *
 * Renders cover -> summary -> one page per item -> appendix, fully awaiting
 * every draw call (drawImage is async) before the footer pass starts, since
 * an interleaved footer draw while a photo decode is still in flight on the
 * same page would be a real bug, not a hypothetical. Only once every
 * content page exists is the true total page count known, so the footer
 * ("page X of Y") runs as a second pass over every already-created page.
 */
export async function generateClaimFile(renderer: PageRenderer): Promise<void> {
  const [profile, allWatches, allPhotos, allDocuments] = await Promise.all([
    getProfile(),
    listWatches(),
    listAllPhotos(),
    listAllDocuments(),
  ]);

  const watches = allWatches.filter((w) => w.status === "owned");
  const generatedDate = new Date().toISOString().slice(0, 10);
  const resolvedProfile = profile ?? {
    full_legal_name: "",
    mailing_address: "",
    insurer_name: "",
    policy_number: "",
  };

  renderCoverPage(renderer, { profile: resolvedProfile, watches, generatedDate });
  renderSummarySchedule(renderer, watches);

  for (const watch of watches) {
    const photos = allPhotos.filter((p) => p.watch_id === watch.id);
    const documents = allDocuments.filter((d) => d.watch_id === watch.id);
    await renderItemPage(renderer, watch, photos, documents);
  }

  await renderAppendix(
    renderer,
    watches.map((watch) => ({
      watch,
      documents: allDocuments.filter((d) => d.watch_id === watch.id),
    })),
  );

  const totalPages = renderer.pageCount();
  const ownerName = resolvedProfile.full_legal_name;
  for (let i = 0; i < totalPages; i++) {
    renderer.selectPage(i);
    drawFooter(renderer, i, totalPages, { generatedDate, ownerName });
  }
}
