import { supabase } from "../../lib/supabase";
import BackButton from "../../components/BackButton";

export const dynamic = "force-dynamic";

function field(label: string, value: unknown) {
  const s = value == null ? "" : String(value).trim();
  if (!s) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: "#e7b457", fontSize: "0.8rem", marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#e7b457", lineHeight: 1.5 }}>{s}</div>
    </div>
  );
}

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

  const name = String(item.name ?? "Achievement");
  const img =
    (item.image_url as string) ||
    (item.image as string) ||
    (item.icon as string) ||
    null;

  return (
    <main style={{ padding: "100px 24px 24px", maxWidth: 560 }}>
      <BackButton label="Achievements" />
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0", color: "#e7b457" }}>{name}</h1>

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

      {field("Objective", item.objective)}
      {field("Title reward", item.title)}
    </main>
  );
}
