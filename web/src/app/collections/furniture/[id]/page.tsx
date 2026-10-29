import { supabase } from "../../../lib/supabase";
import BackButton from "../../../components/BackButton";
import ItemDetail from "../../../components/ItemDetail";

export const dynamic = "force-dynamic";

export default async function FurnitureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("furniture_sets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return (
      <main style={{ padding: 100 }}>
        <p>Not found</p>
        <BackButton label="Furniture" />
      </main>
    );
  }

  return <ItemDetail item={item} backLabel="Furniture" background={{ image: "furniture.webp", blur: 6 }} />;
}