import { supabase } from "../lib/supabase";
import TimersClient from "./TimersClient";

export const dynamic = "force-dynamic";

export default async function TimersPage() {
  const { data, error } = await supabase
    .from("items")
    .select("id, name, growth_time, image_url")
    .eq("category", "gardening")
    .eq("subcategory", "crops")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "110px 24px 24px" }}>
        <h1>Timers</h1>
        <p style={{ color: "#f87171" }}>Error: {error.message}</p>
      </main>
    );
  }

  const crops = ((data ?? []) as Record<string, unknown>[])
    .map((c) => ({
      id: Number(c.id),
      name: String(c.name ?? ""),
      growth_time: String(c.growth_time ?? "").trim(),
      image_url: c.image_url ? String(c.image_url) : null,
    }))
    .filter((c) => c.growth_time !== "");

  return (
    <main style={{ padding: "110px 24px 24px", maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 6px", color: "#e7b457" }}>Timers</h1>
      <p style={{ color: "#e7b457", margin: "0 0 28px" }}>
        Crop growth and respawn timers. They are saved in this browser, so they keep running when you close the page.
      </p>
      <TimersClient crops={crops} />
    </main>
  );
}
