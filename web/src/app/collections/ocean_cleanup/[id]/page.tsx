import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/BackButton";

export const dynamic = "force-dynamic";

export default async function OceanCleanupDetailPage({
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
      <main style={{ padding: 96 }}>
        <p>Not found</p>
        <BackButton label="Ocean Cleanup" />
      </main>
    );
  }

  const row = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return null;
    const s = String(value).trim();
    if (!s || s.toLowerCase() === "all") return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "#94a3b8" }}>{label}: </span>
        <span>{s}</span>
      </div>
    );
  };

  return (
    <main style={{ padding: "96px 24px 24px" }}>
      <BackButton label="Ocean Cleanup" />
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0", color: "#e7b457" }}>{item.name}</h1>
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
      <div style={{ maxWidth: 520, color: "#e8f4ff" }}>
{row("Unlock level", item.unlock_level)}
        {row("Max stars", item.max_stars)}
        {row("Zone", item.location_zone)}
        {row("Location", item.location)}
        {row("Weather", item.weather)}
        {row("Schedule", item.schedule)}
        {row("Shadow", item.shadow)}
        {row(
          "Price 1–5",
          [item.price_1, item.price_2, item.price_3, item.price_4, item.price_5]
            .filter((v) => v != null && v !== "")
            .join(" / ") || null
        )}
        {row("Currency", item.currency)}
        {row("Buy price", item.buy_price)}
        {row("Event", item.event_tag)}
        {row("Source", item.source)}
      </div>
    </main>
  );
}