import { supabase } from "../lib/supabase";
import ItemDetail from "./ItemDetail";
import NotFound from "./NotFound";

export default async function ItemDetailLoader({
  id,
  backLabel,
}: {
  id: string;
  backLabel: string;
}) {
  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return <NotFound backLabel={backLabel} />;
  }

  return <ItemDetail item={item} backLabel={backLabel} />;
}