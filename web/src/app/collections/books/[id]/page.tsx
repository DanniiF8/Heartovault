import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function BooksDetailPage({
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
        <a href="/collections/books" style={{ color: "#7dd3fc" }}>
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
      <a href="/collections/books" style={{ color: "#7dd3fc" }}>
        ← Books
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
          "Seed sell 1–5",
          [item.seed_sell_1, item.seed_sell_2, item.seed_sell_3, item.seed_sell_4, item.seed_sell_5]
            .filter((v) => v != null && v !== "")
            .join(" / ") || null
        )}
        {row(
          "Price 1–5",
          [item.price_1, item.price_2, item.price_3, item.price_4, item.price_5]
            .filter((v) => v != null && v !== "")
            .join(" / ") || null
        )}
        {row(
          "Token price 1–5",
          [
            item.price_sell_token_1,
            item.price_sell_token_2,
            item.price_sell_token_3,
            item.price_sell_token_4,
            item.price_sell_token_5,
          ]
            .filter((v) => v != null && v !== "")
            .join(" / ") || null
        )}
        {row(
          "Energy 1–5",
          [item.energy_1, item.energy_2, item.energy_3, item.energy_4, item.energy_5]
            .filter((v) => v != null && v !== "")
            .join(" / ") || null
        )}
        {row("Mastery apprentice", item.mastery_apprentice_req)}
        {row("Mastery expert", item.mastery_expert_req)}
        {row("Mastery master", item.mastery_master_req)}
        {row("Ingredients", item.ingredients)}
        {row("Event tag", item.event_tag)}
        {row("Hobby", item.hobby)}
        {row("Source", item.source)}
        {row("Set", item.set)}
        {row("Notes", item.notes)}
        {row("Filename", item.filename)}
      </div>
    </main>
  );
}