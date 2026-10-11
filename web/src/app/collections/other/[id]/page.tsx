import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/BackButton";

export const dynamic = "force-dynamic";

export default async function OtherDetailPage({
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
        <BackButton label="Other Collections" />
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

  return (
    <main style={{ padding: "100px 24px 24px", maxWidth: 560 }}>
      <BackButton label="Other Collections" />
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
        {row("Source", item.source)}
        {item.buy_price != null && item.buy_price !== "" ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Price</div>
            <div style={{ color: "#e8f4ff" }}>
              {String(item.buy_price)}
              {item.currency ? ` ${item.currency}` : ""}
            </div>
          </div>
        ) : null}
        {row("Sell price", item.sell_price)}
      </div>
    </main>
  );
}