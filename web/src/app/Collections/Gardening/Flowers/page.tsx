import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function FlowersPage() {
  const { data: items, error } = await supabase
    .from("items")
    .select("id, name, subcategory, location, max_stars, image_url, unlock_level")
    .eq("category", "gardening")
    .eq("subcategory", "flowers")
    .order("order_game", { ascending: true });

  if (error) {
    return (
      <main>
        <h1>Flowers</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "8px" }}>Flowers</h1>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
        {items?.length ?? 0} items
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "16px",
        }}
      >
        {(items ?? []).map((item) => (
          <div
            key={item.id}
            style={{
              background: "#1e3a5f",
              borderRadius: "12px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                width={80}
                height={80}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div style={{ height: 80, opacity: 0.35 }}>No image</div>
            )}
            <div style={{ marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}