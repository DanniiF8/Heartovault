import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/BackButton";

export const dynamic = "force-dynamic";

export default async function GardeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return (
      <main style={{ padding: 100 }}>
        <p>Not found</p>
        <BackButton label="Gardening" />
      </main>
    );
  }

  const row = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return null;
    const s = String(value).trim();
    if (!s || s.toLowerCase() === "all") return null;
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 2 }}>{label}</div>
        <div style={{ color: "#e8f4ff" }}>{s}</div>
      </div>
    );
  };

  const starRows = [1, 2, 3, 4, 5]
    .map((n) => {
      const price = item[`price_${n}` as keyof typeof item];
      const seed = item[`seed_sell_${n}` as keyof typeof item];
      if (
        (price === null || price === undefined || price === "") &&
        (seed === null || seed === undefined || seed === "")
      ) {
        return null;
      }
      return { n, price, seed };
    })
    .filter(Boolean) as { n: number; price: unknown; seed: unknown }[];

  return (
    <main style={{ padding: "100px 24px 24px", maxWidth: 560 }}>
      <BackButton label="Gardening" />
      <h1 style={{ fontSize: "1.75rem", margin: "16px 0", color: "#e7b457" }}>{item.name}</h1>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          width={160}
          height={160}
          style={{ objectFit: "contain", marginBottom: 24 }}
        />
      ) : (
        <div style={{ opacity: 0.4, marginBottom: 24 }}>No image</div>
      )}
      <div>
        {row("Unlock level", item.unlock_level)}
        {row("Max stars", item.max_stars)}
        {row("Growth time", item.growth_time)}
        {row("Seed cost", item.seed_cost)}
        {row("Seed sell", item.seed_sell)}
        {row("Source", item.source)}
        {starRows.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 8 }}>By star</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr",
                gap: 8,
                fontSize: "0.9rem",
                color: "#e8f4ff",
              }}
            >
              <div style={{ color: "#94a3b8" }}>★</div>
              <div style={{ color: "#94a3b8" }}>Price</div>
              <div style={{ color: "#94a3b8" }}>Seed sell</div>
              {starRows.map((r) => (
                <div key={r.n} style={{ display: "contents" }}>
                  <div>{r.n}</div>
                  <div>{r.price != null && r.price !== "" ? String(r.price) : "—"}</div>
                  <div>{r.seed != null && r.seed !== "" ? String(r.seed) : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}