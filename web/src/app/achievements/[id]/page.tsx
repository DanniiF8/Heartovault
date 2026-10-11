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

  const desc =
    item.description ||
    item.desc ||
    item.details ||
    item.how_to ||
    item.requirement ||
    null;

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
      {desc ? (
        <p style={{ color: "#e8f4ff", lineHeight: 1.5 }}>{String(desc)}</p>
      ) : (
        <p style={{ color: "#94a3b8" }}>No description yet.</p>
      )}
    </main>
  );
}