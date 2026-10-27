import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function WorldAnimalsPage() {
  const { data: rows, error } = await supabase
    .from("world_animals")
    .select("id, game_order, name, location, weather, food, event_tag, category")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 72 }}>
        <h1>World Animals</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 8 }}>World Animals</h1>
      <p style={{ color: "#e7b457", opacity: 0.8, marginBottom: 24 }}>
        {rows?.length ?? 0} animals
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {(rows ?? []).map((a) => (
          <a
            key={a.id}
            href={`/animals/world_animals/${a.id}`}
            style={{
              background: "#0a2a5c",
              borderRadius: 12,
              padding: 12,
              textDecoration: "none",
              color: "#e7b457",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700 }}>{a.name}</div>
            {a.location && (
              <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 4 }}>
                {a.location}
              </div>
            )}
          </a>
        ))}
      </div>
    </main>
  );
}