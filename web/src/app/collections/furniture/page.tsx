import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function FurniturePage() {
  const { data: rows, error } = await supabase
    .from("furniture_sets")
    .select("id, game_order, name, total_pieces, source, category, subcategory")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 72 }}>
        <h1>Furniture</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 8 }}>Furniture</h1>
      <p style={{ color: "#e7b457", opacity: 0.8, marginBottom: 24 }}>
        {rows?.length ?? 0} sets
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {(rows ?? []).map((s) => (
          <a
            key={s.id}
            href={`/collections/furniture/${s.id}`}
            style={{
              background: "#0a2a5c",
              borderRadius: 12,
              padding: 12,
              textDecoration: "none",
              color: "#e7b457",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.name}</div>
            {s.total_pieces != null && (
              <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 4 }}>
                {s.total_pieces} pieces
              </div>
            )}
          </a>
        ))}
      </div>
    </main>
  );
}