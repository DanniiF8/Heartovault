import { supabase } from "../../../lib/supabase";
import ItemDetail from "../../../components/ItemDetail";
import PageBackground from "../../../components/PageBackground";

export const dynamic = "force-dynamic";

export default async function InsectCatchingDetailPage({
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

  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="insects.webp" />
      <ItemDetail item={item} backLabel="Insect Catching" />
    </div>
  );
}