import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.kronosaegis.com";
  const paths = ["", "/scan", "/depth", "/ledger", "/agents", "/learn", "/token"];
  return paths.map((p) => ({ url: base + p, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 }));
}
