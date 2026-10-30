import ItemDetailLoader from "../../../../components/ItemDetailLoader";

export const dynamic = "force-dynamic";

export default async function FlowersDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetailLoader id={id} backLabel="Gardening" />;
}