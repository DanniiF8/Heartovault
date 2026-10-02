export default function GardeningHubPage() {
  return (
    <main>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "16px" }}>Gardening</h1>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
        Choose a category
      </p>
      <div style={{ display: "flex", gap: "16px" }}>
        <a
          href="/collections/gardening/flowers"
          style={{
            padding: "16px 28px",
            background: "#1e3a5f",
            color: "#e8f4ff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Flowers
        </a>
        <a
          href="/collections/gardening/crops"
          style={{
            padding: "16px 28px",
            background: "#1e3a5f",
            color: "#e8f4ff",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Crops
        </a>
      </div>
    </main>
  );
}