import type { MetadataRoute } from "next";
import { supabase } from "./lib/supabase";
import { siteUrl } from "./siteConfig";
import { collectionsLinks } from "./collectionsLinks";

export const dynamic = "force-dynamic";

// onde fica a página de detalhe de cada categoria
const DETAIL_PATH: Record<string, string> = {
  fish: "/collections/fishing",
  birds: "/collections/birdwatching",
  insects: "/collections/insect_catching",
  recipes: "/collections/cooking",
  ocean_cleanup: "/collections/ocean_cleanup",
  other_collections: "/collections/other",
  snow_sculpture: "/collections/snow_sculpture",
  sand_sculpture: "/collections/sand_sculpture",
  pumpkin_carving: "/collections/pumpkin_carving",
};

type Row = { id: number; category: string | null; subcategory: string | null };

async function allItems(): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("items")
      .select("id, category, subcategory")
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    out.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) return [];
  const now = new Date();

  const fixed = [
    "",
    "/collections",
    ...collectionsLinks.map((l) => l.href),
    "/achievements",
    "/shops",
    "/shop",
    "/more",
    "/timers",
    "/weather",
    "/map",
    "/codes",
    "/about",
    "/privacy",
    "/contact",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const items = (await allItems()).flatMap((r) => {
    let base = r.category ? DETAIL_PATH[r.category] : undefined;
    if (r.category === "gardening") base = `/collections/gardening/${r.subcategory === "flowers" ? "flowers" : "crops"}`;
    if (!base) return [];
    return [{ url: `${siteUrl}${base}/${r.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 }];
  });

  return [...fixed, ...items];
}
