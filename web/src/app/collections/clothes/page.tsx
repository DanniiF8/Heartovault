import { supabase } from "../../lib/supabase";
import ItemListWithFilters from "../../components/ItemListWithFilters";

export const dynamic = "force-dynamic";

export default async function ClothesPage() {
  const { data: rows, error } = await supabase
    .from("clothing_sets")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 100 }}>
        <h1>Clothes</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  const items = (rows ?? []).map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    name: String(row.name ?? "Set"),
    image_url: (row.image_url as string) || null,
    game_order: Number(row.game_order ?? row.id),
    unlock_level: null,
    max_stars: null,
    source: (row.source as string) || null,
    subcategory: null,
    location: null,
    location_zone: null,
    weather: null,
    schedule: null,
    event_tag: null,
    shadow: null,
    price_1: null,
    price_2: null,
    price_3: null,
    price_4: null,
    price_5: null,
    filter: null,
    currency: null,
    buy_price: null,
  }));

  return (
    <ItemListWithFilters
      title="Clothes"
      basePath="/collections/clothes"
      items={items}
      parentHref="/collections"
      parentLabel="Collections"
    />
  );
}