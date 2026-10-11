import { supabase } from "../lib/supabase";
import ItemListWithFilters from "../components/ItemListWithFilters";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  if (!term) {
    return (
      <main style={{ padding: "96px 24px 24px" }}>
        <h1>Search</h1>
        <p style={{ color: "#94a3b8" }}>Type something in the search bar above.</p>
      </main>
    );
  }

  const { data: items, error } = await supabase
    .from("items")
    .select(
      "id, name, category, subcategory, unlock_level, max_stars, image_url, location, location_zone, weather, schedule, event_tag, shadow, game_order, price_1, price_2, price_3, price_4, price_5, filter, currency, buy_price, source"
    )
    .ilike("name", `%${term}%`)
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    return (
      <main style={{ padding: "96px 24px 24px" }}>
        <h1>Search</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  return (
    <ItemListWithFilters
      title={`Search: ${term}`}
      basePath="/search/item"
      items={items ?? []}
    />
  );
}