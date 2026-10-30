import ItemDetailLoader from "../../../components/ItemDetailLoader";

export const dynamic = "force-dynamic";

export default async function FurnitureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ItemDetailLoader
      id={id}
      backLabel="Furniture"
      table="furniture_sets"
      background={{ image: "furniture.webp", blur: 6 }}
    />
  );
}