import { supabase } from "../../lib/supabase";
import ItemListWithFilters from "../../components/ItemListWithFilters";
import PageBackground from "../../components/PageBackground";

export const dynamic = "force-dynamic";

export default async function InsectCatchingPage() {
  const { data: items, error } = await supabase
    .from("items")
    .select(
      "id, name, subcategory, unlock_level, max_stars, image_url, location, location_zone, weather, schedule, event_tag, shadow, game_order, price_1, price_2, price_3, price_4, price_5, filter, currency, buy_price, source"
    )
    .eq("category", "insects")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 96 }}>
        <h1>Insect Catching</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <div style={{ position: "relative", isolation: "isolate", color: "var(--hv-text)" }}>
      <PageBackground image="bg-insects.webp" />
      <ItemListWithFilters
        title="Insect Catching"
        basePath="/collections/insect_catching"
        items={items ?? []}
        parentHref="/collections"
        parentLabel="Collections"
      />
    </div>
  );
}