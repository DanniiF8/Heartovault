import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const { data: items, error } = await supabase
    .from("achievements")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "96px 24px 24px" }}>
        <h1>Achievements</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "96px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>
        Achievements
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
        }}
      >
        {(items ?? []).map((item: Record<string, unknown>) => {
          const id = item.id as number;
          const name = String(item.name ?? item.title ?? "Achievement");
          const img =
            (item.image_url as string) ||
            (item.image as string) ||
            (item.icon as string) ||
            null;

          return (
            <a
              key={id}
              href={`/achievements/${id}`}
              style={{
                background: "#0a2a5c",
                borderRadius: 12,
                padding: 12,
                textAlign: "center",
                color: "#e7b457",
                textDecoration: "none",
              }}
            >
              {img ? (
                <img
                  src={img}
                  alt={name}
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <div style={{ height: 80, opacity: 0.35 }}>No image</div>
              )}
              <div style={{ marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
                {name}
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}