import Link from "next/link";

export default function ReportError({ item }: { item: Record<string, unknown> }) {
  const params = new URLSearchParams({
    report: "1",
    name: String(item.name ?? ""),
    category: String(item.category ?? ""),
    id: String(item.id ?? ""),
  });
  return (
    <p style={{ marginTop: 32 }}>
      <Link
        href={`/contact?${params.toString()}`}
        style={{ color: "var(--hv-link)", fontSize: "0.85rem" }}
      >
        Found a mistake? Report it
      </Link>
    </p>
  );
}