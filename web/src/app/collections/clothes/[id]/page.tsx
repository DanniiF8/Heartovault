import ItemDetailLoader from "../../../components/ItemDetailLoader";

export const dynamic = "force-dynamic";

export default async function ClothesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ItemDetailLoader
      id={id}
      backLabel="Clothes"
      table="clothing_sets"
      background={{ image: "clothes.webp", blur: 6 }}
    />
  );
}