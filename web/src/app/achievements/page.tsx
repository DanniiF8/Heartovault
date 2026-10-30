import { supabase } from "../lib/supabase";
import PageBackground from "../components/PageBackground";
import AchievementsList, { Achievement } from "./AchievementsList";

export const dynamic = "force-dynamic";

function clean(v: unknown) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

export default async function AchievementsPage() {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "110px 24px 24px" }}>
        <h1
          style={{
            fontSize: "2.7rem",
            color: "#e7b457",
            textShadow: "0 2px 6px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.9)",
          }}
        >
          Achievements
        </h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  const items: Achievement[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: clean(r.name) || "Achievement",
    objective: clean(r.objective),
    title: clean(r.title),
    type: clean(r.type),
    image: ((r.image_url as string) || (r.image as string) || (r.icon as string) || null) as string | null,
  }));

  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="achievements.webp" blur={6} />
      <main style={{ padding: "110px 24px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <p
          style={{
            color: "#e7b457",
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: "1.15rem",
            margin: "0 0 24px",
            textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)",
          }}
        >
          Tap an achievement to see its mission and title.
        </p>
        <AchievementsList items={items} />
      </main>
    </div>
  );
}