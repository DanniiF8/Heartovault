import { siteConfig } from "../siteConfig";

export default function ReportError({ item }: { item: Record<string, unknown> }) {
  if (!siteConfig.contactEmail) return null;
  const name = String(item.name ?? "");
  const subject = encodeURIComponent(`${siteConfig.name}: correction for ${name}`);
  const body = encodeURIComponent(
    `Item: ${name}\nCategory: ${String(item.category ?? "")}\nID: ${String(item.id ?? "")}\n\nWhat is wrong:\n`
  );
  return (
    <p style={{ marginTop: 32 }}>
      <a
        href={`mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`}
        style={{ color: "var(--hv-link)", fontSize: "0.85rem" }}
      >
        Found a mistake? Report it
      </a>
    </p>
  );
}