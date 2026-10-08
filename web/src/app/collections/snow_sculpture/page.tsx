import { supabase } from "../../lib/supabase";
import ItemListWithFilters from "../../components/ItemListWithFilters";

export const dynamic = "force-dynamic";

export default async function SnowSculpturePage() {
  const { data: items, error } = await supabase
    .from("items")
    .select(
      "id, name, subcategory, unlock_level, max_stars, image_url, location, location_zone, weather, schedule, event_tag, shadow, game_order, price_1, price_2, price_3, price_4, price_5"
    )
    .eq("category", "other_collections")
    .eq("subcategory", "snow_sculpture")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 72 }}>
        <h1>Snow Sculpture</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <ItemListWithFilters
      title="Snow Sculpture"
      basePath="/collections/snow_sculpture"
      items={items ?? []}
    />
  );
}