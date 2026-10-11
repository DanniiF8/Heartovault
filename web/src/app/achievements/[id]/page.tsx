import { supabase } from "../../lib/supabase";
import BackButton from "../../components/BackButton";

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
      <main style={{ padding: 100 }}>
        <p>Not found</p>
        <BackButton label="Achievements" />
      </main>
    );
  }

  const name = String(item.name ?? item.title ?? "Achievement");
  const img =
    (item.image_url as string) ||
    (item.image as string) ||
    (item.icon as string) ||
    null;

  const row = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return null;
    const s = String(value).trim();
    if (!s || s.toLowerCase() === "all") return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "#94a3b8" }}>{label}: </span>
        <span>{s}</span>
      </div>
    );
  };

  return (
    <main style={{ padding: "100px 24px 24px", maxWidth: 560 }}>
      <BackButton label="Achievements" />
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0", color: "#e7b457" }}>
        {name}
      </h1>
      {img ? (
        <img
          src={img}
          alt={name}
          width={160}
          height={160}
          style={{ objectFit: "contain", marginBottom: 24 }}
        />
      ) : (
        <div style={{ opacity: 0.4, marginBottom: 24 }}>No image</div>
      )}
      <div style={{ color: "#e8f4ff" }}>
        {row("Description", item.description)}
        {row("Category", item.category)}
        {row("Points", item.points)}
      </div>
    </main>
  );
}