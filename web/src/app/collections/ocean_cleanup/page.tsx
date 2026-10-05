import { supabase } from "../../lib/supabase";
import ItemListWithFilters from "../../components/ItemListWithFilters";

export const dynamic = "force-dynamic";

export default async function OceanCleanupPage() {
  const { data: items, error } = await supabase
    .from("items")
    .select(
      "id, name, subcategory, unlock_level, max_stars, image_url, location, weather, schedule, event_tag, price_1, price_2, price_3, price_4, price_5"
    )
    .eq("category", "ocean_cleanup")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Ocean Cleanup</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <ItemListWithFilters
      title="Ocean Cleanup"
      basePath="/collections/ocean_cleanup"
      items={items ?? []}
    />
  );
}