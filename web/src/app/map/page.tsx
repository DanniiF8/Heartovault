import { EB_Garamond } from "next/font/google";
import { supabase } from "../lib/supabase";
import PageBackground from "../components/PageBackground";
import MapViewer from "./MapViewer";
import type { PanelItem } from "./ZonePanel";

const body = EB_Garamond({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { data } = await supabase
    .from("items")
    .select("id, name, category, image_url, location, location_zone")
    .in("category", ["birds", "fish", "insects"])
    .order("game_order", { ascending: true });

  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="map.webp" blur={6} />
      <main className={body.className} style={{ padding: "110px 16px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <MapViewer items={(data ?? []) as PanelItem[]} />
      </main>
    </div>
  );
}