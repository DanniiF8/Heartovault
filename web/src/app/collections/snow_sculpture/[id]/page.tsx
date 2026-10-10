import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function SnowSculptureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return (
      <main style={{ padding: 72 }}>
        <p>Not found</p>
        <a href="/collections/snow_sculpture" style={{ color: "#7dd3fc" }}>
          ← Back
        </a>
      </main>
    );
  }

  const row = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "#94a3b8" }}>{label}: </span>
        <span>{String(value)}</span>
      </div>
    );
  };

  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <a href="/collections/snow_sculpture" style={{ color: "#7dd3fc" }}>
        ← Snow Sculpture
      </a>

      <h1 style={{ fontSize: "1.75rem", margin: "16px 0" }}>{item.name}</h1>

      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          width={160}
          height={160}
          style={{ objectFit: "contain", marginBottom: 24 }}
        />
      ) : (
        <div style={{ opacity: 0.4, marginBottom: 24 }}>No image</div>
      )}

      <div style={{ maxWidth: 520 }}>
        {row("Category", item.category)}
        {row("Subcategory", item.subcategory)}
        {row("Filter", item.filter)}
        {row("Zone", item.location_zone)}
        {row("Location", item.location)}
        {row("Unlock level", item.unlock_level)}
        {row("Max stars", item.max_stars)}
        {row("Weather", item.weather)}
        {row("Schedule", item.schedule)}
        {row("Shadow", item.shadow)}
        {row("Growth time", item.growth_time)}
        {row("Seed cost", item.seed_cost)}
        {row("Seed sell", item.seed_sell)}
        {row(
          "Price 1–5",
          [item.price_1, item.price_2, item.price_3, item.price_4, item.price_5]
            .filter((v) => v != null && v !== "")
            .join(" / ") || null
        )}
        {row("Currency", item.currency)}
        {row("Buy price", item.buy_price)}
        {row("Sell price", item.sell_price)}
        {row("Source", item.source)}
        {row("Event tag", item.event_tag)}
        {row("Hobby", item.hobby)}
        {row("Notes", item.notes)}
      </div>
    </main>
  );
}