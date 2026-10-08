export default function AnimalsPage() {
  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24 }}>Animals</h1>
      <a
        href="/animals/world_animals"
        style={{
          display: "inline-block",
          background: "#0a2a5c",
          borderRadius: 12,
          padding: 16,
          color: "#e7b457",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        World Animals
      </a>
    </main>
  );
}