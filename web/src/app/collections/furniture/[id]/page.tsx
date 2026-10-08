import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function FurnitureSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("furniture_sets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return (
      <main style={{ padding: 72 }}>
        <p>Not found</p>
        <a href="/collections/furniture" style={{ color: "#7dd3fc" }}>
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
      <a href="/collections/furniture" style={{ color: "#7dd3fc" }}>
        ← Furniture
      </a>
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0" }}>{item.name}</h1>
      <div style={{ maxWidth: 520 }}>
        {row("Total pieces", item.total_pieces)}
        {row("Source", item.source)}
        {row("Living room", item.living_room)}
        {row("Bedroom", item.bedroom)}
        {row("Kitchen", item.kitchen)}
        {row("Bathroom", item.bathroom)}
        {row("Outdoor", item.outdoor)}
        {row("Lighting", item.lighting)}
        {row("Appliance", item.appliance)}
        {row("Decorates", item.decorates)}
        {row("Building material", item.building_material)}
        {row("Category", item.category)}
        {row("Subcategory", item.subcategory)}
      </div>
    </main>
  );
}