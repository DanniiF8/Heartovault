import { supabase } from "../../lib/supabase";
import ItemListWithFilters from "../../components/ItemListWithFilters";

export const dynamic = "force-dynamic";

export default async function FishingPage() {
  const { data: items, error } = await supabase
    .from("items")
    .select(
      "id, name, subcategory, unlock_level, max_stars, image_url, location, weather, schedule, event_tag, price_1, price_2, price_3, price_4, price_5"
    )
    .eq("category", "fish")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Fishing</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <ItemListWithFilters
      title="Fishing"
      basePath="/collections/fishing"
      items={items ?? []}
    />
  );
}