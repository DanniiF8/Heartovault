import { supabase } from "../lib/supabase";
import { itemKey } from "../lib/itemKey";
import { collectionsLinks } from "../collectionsLinks";
import CollectionsGrid, { CollectionTile } from "./CollectionsGrid";

export const dynamic = "force-dynamic";

// que categoria da tabela items vai para que coleção
const CATEGORY_TO_HREF: Record<string, string> = {
  gardening: "/collections/gardening",
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

type Row = { category?: string | null; name?: string | null; set?: string | null };

async function allItems(): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("items")
      .select("category, name, set")
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    out.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return out;
}

async function names(table: "clothing_sets" | "furniture_sets"): Promise<string[]> {
  const { data } = await supabase.from(table).select("name");
  return ((data ?? []) as { name?: string | null }[]).map((r) => String(r.name ?? "Set"));
}

export default async function CollectionsPage() {
  const keysByHref: Record<string, string[]> = {};
  for (const row of await allItems()) {
    const href = row.category ? CATEGORY_TO_HREF[row.category] : undefined;
    if (!href) continue;
    (keysByHref[href] ??= []).push(itemKey({ name: row.name, set: row.set }));
  }
  keysByHref["/collections/clothes"] = (await names("clothing_sets")).map((n) => itemKey({ name: n }));
  keysByHref["/collections/furniture"] = (await names("furniture_sets")).map((n) => itemKey({ name: n }));

  const tiles: CollectionTile[] = collectionsLinks.map((l) => ({
    href: l.href,
    label: l.label,
    icon: l.icon,
    keys: keysByHref[l.href] ?? [],
  }));

  return (
    <main
      style={{
        padding: "110px 24px 24px",
        minHeight: "100vh",
        boxSizing: "border-box",
        // fundo opcional: se existir /public/backgrounds/collections.webp aparece com uma camada escura por cima
        background:
          "linear-gradient(rgba(2,12,36,0.78), rgba(2,12,36,0.92)), url(/backgrounds/collections.webp) center / cover fixed, #06122e",
      }}
    >
      <CollectionsGrid tiles={tiles} />
    </main>
  );
}