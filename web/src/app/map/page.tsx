import { supabase } from "../lib/supabase";
import MapViewer, { Marker } from "./MapViewer";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const { data, error } = await supabase
    .from("map_markers")
    .select("id, layer, label, x, y, note")
    .limit(1000);

  const markers: Marker[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    layer: String(r.layer ?? ""),
    label: r.label ? String(r.label) : null,
    x: Number(r.x),
    y: Number(r.y),
    note: r.note ? String(r.note) : null,
  }));

  return (
    <main style={{ padding: "110px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 6px", color: "#e7b457" }}>Map</h1>
      <p style={{ color: "#e7b457", margin: "0 0 20px" }}>
        Choose what to show. Drag to move, scroll or use the buttons to zoom.
      </p>
      {error && <p style={{ color: "#f87171" }}>Could not load the markers: {error.message}</p>}
      <MapViewer markers={markers} />
    </main>
  );
}