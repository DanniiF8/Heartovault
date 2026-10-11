import { supabase } from "../../../lib/supabase";
import ItemDetail from "../../../components/ItemDetail";

export const dynamic = "force-dynamic";

export default async function BirdwatchingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: item, error } = await supabase.from("items").select("*").eq("id", id).single();

  if (error || !item) {
    return (
      <main style={{ padding: 100 }}>
        <p>Not found</p>
      </main>
    );
  }

  return <ItemDetail item={item} backLabel="Birdwatching" />;
}