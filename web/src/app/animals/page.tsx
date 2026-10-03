export default function AnimalsPage() {
  return (
    <main>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "16px" }}>Animals</h1>
      <div style={{ display: "flex", gap: "16px" }}>
        <a
          href="/animals/world_animals"
          style={{
            padding: "16px 28px",
            background: "#1e3a5f",
            color: "#e8f4ff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          World Animals
        </a>
        <a
          href="/animals/pets"
          style={{
            padding: "16px 28px",
            background: "#1e3a5f",
            color: "#e8f4ff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Pets
        </a>
      </div>
    </main>
  );
}