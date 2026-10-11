import { supabase } from "../../lib/supabase";
import BackButton from "../../components/BackButton";

export const dynamic = "force-dynamic";

export default async function ShopDetailPage({
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
        <BackButton label="Ka Ching Store" />
      </main>
    );
  }

  const currency = item.currency ? String(item.currency) : "";
  const price = item.buy_price;

  return (
    <main style={{ padding: "100px 24px 24px", maxWidth: 560 }}>
      <BackButton label="Ka Ching Store" />
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
      {(price != null && price !== "") || currency ? (
        <div style={{ marginBottom: 12, color: "#e8f4ff", fontSize: "1.1rem" }}>
          {price != null && price !== "" ? String(price) : ""}
          {currency ? ` ${currency}` : ""}
        </div>
      ) : null}
      {item.source ? (
        <div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Where</div>
          <div style={{ color: "#e8f4ff" }}>{item.source}</div>
        </div>
      ) : null}
    </main>
  );
}