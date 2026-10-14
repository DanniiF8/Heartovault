import { moreLinks } from "../menuLinks";

export default function MorePage() {
  return (
    <main style={{ padding: "110px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>More</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {moreLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              background: "#0a2a5c",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              textDecoration: "none",
              color: "#e7b457",
              fontWeight: 600,
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </main>
  );
}