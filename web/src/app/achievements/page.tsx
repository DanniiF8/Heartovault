import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const { data: rows, error } = await supabase
    .from("achievements")
    .select("id, game_order, name, objective, title, category")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 72 }}>
        <h1>Achievements</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 8 }}>Achievements</h1>
      <p style={{ color: "#e7b457", opacity: 0.8, marginBottom: 24 }}>
        {rows?.length ?? 0} achievements
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
        {(rows ?? []).map((a) => (
          <a
            key={a.id}
            href={`/achievements/${a.id}`}
            style={{
              background: "#0a2a5c",
              borderRadius: 12,
              padding: 16,
              textDecoration: "none",
              color: "#e7b457",
            }}
          >
            <div style={{ fontWeight: 700 }}>{a.name}</div>
            {a.title && (
              <div style={{ fontSize: "0.9rem", opacity: 0.85, marginTop: 4 }}>
                Title: {a.title}
              </div>
            )}
            {a.objective && (
              <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 4 }}>
                {a.objective}
              </div>
            )}
          </a>
        ))}
      </div>
    </main>
  );
}