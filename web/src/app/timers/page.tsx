import { EB_Garamond } from "next/font/google";
import PageBackground from "../components/PageBackground";
import { supabase } from "../lib/supabase";
import TimersClient from "./TimersClient";

const body = EB_Garamond({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

const pStyle = {
  textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)",
  color: "#e7b457",
  lineHeight: 1.7,
  margin: "0 0 28px",
  fontSize: "1.15rem",
} as const;

export default async function TimersPage() {
  const { data, error } = await supabase
    .from("items")
    .select("id, name, growth_time, image_url")
    .eq("category", "gardening")
    .eq("subcategory", "crops")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <div style={{ position: "relative", isolation: "isolate" }}>
        <PageBackground image="timers.webp" blur={6} />
        <main className={body.className} style={{ padding: "110px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
          <p style={{ ...pStyle, color: "#f87171" }}>Error: {error.message}</p>
        </main>
      </div>
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
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="timers.webp" blur={6} />
      <main className={body.className} style={{ padding: "110px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
        <TimersClient crops={crops} />
      </main>
    </div>
  );
}