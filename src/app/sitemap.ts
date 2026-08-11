import type { MetadataRoute } from "next";

const SITE_URL = "https://systemly.me";
const SITEMAP_REVALIDATE_SECONDS = 60 * 60;

type PublicBusinessSitemapEntry = {
  slug: string;
  updatedAt: string;
};

type ApiResponse = {
  data: PublicBusinessSitemapEntry[];
};

async function getPublicBusinessSitemapEntries() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "");
  if (!backendUrl) return [];

  try {
    const response = await fetch(`${backendUrl}/businesses/public/sitemap`, {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as ApiResponse;
    return Array.isArray(payload.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicBusinesses = await getPublicBusinessSitemapEntries();

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...publicBusinesses.flatMap(({ slug, updatedAt }) => {
      const businessUrl = `${SITE_URL}/${encodeURIComponent(slug)}`;
      const lastModified = new Date(updatedAt);

      return [
        {
          url: businessUrl,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
        {
          url: `${businessUrl}/book`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ];
    }),
  ];
}
