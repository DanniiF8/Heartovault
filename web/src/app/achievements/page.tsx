import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

function clean(v: unknown) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

export default async function AchievementsPage() {
  const { data: items, error } = await supabase
    .from("achievements")
    .select("*")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "110px 24px 24px" }}>
        <h1>Achievements</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "110px 24px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>Achievements</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {(items ?? []).map((item: Record<string, unknown>) => {
          const id = item.id as number;
          const name = clean(item.name) || "Achievement";
          const objective = clean(item.objective);
          const title = clean(item.title);
          const img =
            (item.image_url as string) ||
            (item.image as string) ||
            (item.icon as string) ||
            null;

          return (
            <div
              key={id}
              style={{
                background: "#0a2a5c",
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              {img ? (
                <img
                  src={img}
                  alt=""
                  width={64}
                  height={64}
                  style={{ objectFit: "contain", display: "block", margin: "0 auto 8px" }}
                />
              ) : null}
              <div style={{ color: "#e7b457", fontWeight: 700, fontSize: "1rem" }}>{name}</div>
              {objective && (
                <div style={{ color: "#e8f4ff", fontSize: "0.88rem", marginTop: 8, lineHeight: 1.4 }}>
                  {objective}
                </div>
              )}
              {title && (
                <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 10 }}>
                  Title: <span style={{ color: "#f3d98b" }}>{title}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
