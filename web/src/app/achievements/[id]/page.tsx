import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return (
      <main style={{ padding: 72 }}>
        <p>Not found</p>
        <a href="/achievements" style={{ color: "#7dd3fc" }}>
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
      <a href="/achievements" style={{ color: "#7dd3fc" }}>
        ← Achievements
      </a>
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0" }}>{item.name}</h1>
      <div style={{ maxWidth: 520 }}>
        {row("Title", item.title)}
        {row("Objective", item.objective)}
        {row("Category", item.category)}
        {row("Game order", item.game_order)}
      </div>
    </main>
  );
}