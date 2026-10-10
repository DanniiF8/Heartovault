export default function GardeningPage() {
  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24 }}>Gardening Catalog</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href="/collections/gardening/flowers"
          style={{
            background: "#0a2a5c",
            borderRadius: 12,
            padding: 16,
            color: "#e7b457",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Flowers
        </a>
        <a
          href="/collections/gardening/crops"
          style={{
            background: "#0a2a5c",
            borderRadius: 12,
            padding: 16,
            color: "#e7b457",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Crops
        </a>
      </div>
    </main>
  );
}