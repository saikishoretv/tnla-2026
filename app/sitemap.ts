import type { MetadataRoute } from "next";

const BASE = "https://allelectoralresults.info";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const tnConstituencies = Array.from({ length: 234 }, (_, i) => ({
    url: `${BASE}/tnla2026/constituency/${i + 1}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const keralaConstituencies = Array.from({ length: 140 }, (_, i) => ({
    url: `${BASE}/kerala2026/constituency/${i + 1}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const pondicherryConstituencies = Array.from({ length: 30 }, (_, i) => ({
    url: `${BASE}/pondicherry2026/constituency/${i + 1}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/tnla2026`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/tnla2026/results`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tnla2026/star-candidates`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/kerala2026`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/kerala2026/results`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pondicherry2026`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/pondicherry2026/results`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...tnConstituencies,
    ...keralaConstituencies,
    ...pondicherryConstituencies,
  ];
}
