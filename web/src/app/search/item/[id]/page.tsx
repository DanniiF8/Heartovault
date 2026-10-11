import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function SearchItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: item } = await supabase.from("items").select("*").eq("id", id).single();

  if (!item) {
    return (
      <main style={{ padding: 96 }}>
        <p>Not found</p>
        <a href="/search" style={{ color: "#7dd3fc" }}>
          ← Search
        </a>
      </main>
    );
  }

  return (
    <main style={{ padding: "96px 24px 24px" }}>
      <a href="/search" style={{ color: "#7dd3fc" }}>
        ← Search
      </a>
      <h1 style={{ marginTop: 16 }}>{item.name}</h1>
      <p style={{ color: "#94a3b8" }}>
        {item.category}
        {item.subcategory ? ` / ${item.subcategory}` : ""}
      </p>
    </main>
  );
}