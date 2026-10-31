import { supabase } from "../lib/supabase";
import ShopGrid from "./ShopGrid";

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
      <main style={{ padding: "110px 24px 24px" }}>
        <h1>Ka Ching Store</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  const items = (data ?? []) as ShopItem[];

  return (
    <main style={{ padding: "110px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>Ka Ching Store</h1>
      <ShopGrid
        items={items.map((item) => ({
          id: item.id,
          name: String(item.name ?? ""),
          price: priceText(item.buy_price, item.currency),
          image_url: item.image_url,
        }))}
      />
    </main>
  );
}
