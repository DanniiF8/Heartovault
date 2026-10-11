import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

type ShopItem = {
  id: number;
  name: string | null;
  buy_price: number | string | null;
  currency: string | null;
  image_url: string | null;
};

const CURRENCIES: Record<string, { one: string; many: string }> = {
  gold: { one: "Gold", many: "Gold" },
  pink_star: { one: "Pink Star", many: "Pink Stars" },
  blue_heart: { one: "Blue Heart", many: "Blue Hearts" },
};

function priceText(price: ShopItem["buy_price"], currency: string | null) {
  const p = price == null ? "" : String(price).trim();
  const key = (currency ?? "").trim();
  const c = CURRENCIES[key];
  const unit = c ? (p === "1" ? c.one : c.many) : key.replace(/_/g, " ");
  if (!p) return `Price TBD${unit ? ` (${unit})` : ""}`;
  return unit ? `${p} ${unit}` : p;
}

export default async function ShopPage() {
  const { data, error } = await supabase
    .from("items")
    .select("id, name, buy_price, currency, image_url")
    .eq("category", "ka_ching_store")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "96px 24px 24px" }}>
        <h1>Ka Ching Store</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  const items = (data ?? []) as ShopItem[];

  return (
    <main style={{ padding: "110px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>Ka Ching Store</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#0a2a5c",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
            }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name ?? ""}
                width={72}
                height={72}
                style={{ objectFit: "contain", marginBottom: 8 }}
              />
            ) : null}
            <div style={{ color: "#e7b457", fontWeight: 600, fontSize: "0.95rem" }}>
              {item.name}
            </div>
            <div style={{ color: "#e8f4ff", fontSize: "0.85rem", marginTop: 6 }}>
              {priceText(item.buy_price, item.currency)}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
