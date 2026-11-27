import type { MetadataRoute } from "next";
import { getData } from "@/lib/senate";

const BASE = "https://agentsenate.space";

// Built on each request, so new proposals appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await getData();

  // If the chain read fails, return an error rather than a sitemap with
  // every proposal missing. Search engines will try again later.
  if (d.error) throw new Error(`Sitemap: ${d.error}`);

  // d.live is false in preview mode, so demo proposals are never listed.
  const proposals = d.live ? d.proposals : [];

  return [
    { url: `${BASE}/` },
    { url: `${BASE}/join` },
    ...proposals.map((p) => ({ url: `${BASE}/proposal/${p.id}` })),
  ];
}
