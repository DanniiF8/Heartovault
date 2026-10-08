import { supabase } from "../../../lib/supabase";
import ItemListWithFilters from "../../../components/ItemListWithFilters";

export const dynamic = "force-dynamic";

export default async function FlowersPage() {
  const { data: items, error } = await supabase
    .from("items")
    .select(
      "id, name, subcategory, unlock_level, max_stars, image_url, location, location_zone, weather, schedule, event_tag, shadow, game_order, price_1, price_2, price_3, price_4, price_5"
    )
    .eq("category", "gardening")
    .eq("subcategory", "flowers")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 72 }}>
        <h1>Flowers</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <ItemListWithFilters
      title="Flowers"
      basePath="/collections/gardening/flowers"
      items={items ?? []}
    />
  );
}