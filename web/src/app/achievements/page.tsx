import { supabase } from "../lib/supabase";
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
        <h1>Achievements</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  const items: Achievement[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: clean(r.name) || "Achievement",
    objective: clean(r.objective),
    title: clean(r.title),
    image: ((r.image_url as string) || (r.image as string) || (r.icon as string) || null) as string | null,
  }));

  return (
    <main style={{ padding: "110px 24px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 6, color: "#e7b457" }}>Achievements</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>Tap an achievement to see its mission and title.</p>
      <AchievementsList items={items} />
    </main>
  );
}
