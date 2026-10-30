import type { ComponentProps } from "react";
import { supabase } from "../lib/supabase";
import ItemDetail from "./ItemDetail";
import NotFound from "./NotFound";

export default async function ItemDetailLoader({
  id,
  backLabel,
  table = "items",
  background,
}: {
  id: string;
  backLabel: string;
  table?: string;
  background?: ComponentProps<typeof ItemDetail>["background"];
}) {
  const { data: item, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    return <NotFound backLabel={backLabel} />;
  }

  return <ItemDetail item={item} backLabel={backLabel} background={background} />;
}