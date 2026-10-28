import { supabase } from "../../lib/supabase";
import PageBackground from "../../components/PageBackground";
import WorldAnimalsList, { WorldAnimal } from "./WorldAnimalsList";

export const dynamic = "force-dynamic";

export default async function WorldAnimalsPage() {
  const { data, error } = await supabase
    .from("world_animals")
    .select("id, game_order, name")
    .order("game_order", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "110px 24px 24px" }}>
        <h1>World Animals</h1>
        <p style={{ color: "#f87171" }}>{error.message}</p>
      </main>
    );
  }

  const items: WorldAnimal[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: String(r.name ?? "").replace(/\s+/g, " ").trim() || "Animal",
  }));

  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="world_animals.webp" blur={5} />
      <main style={{ padding: "110px 24px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <WorldAnimalsList items={items} />
      </main>
    </div>
  );
}