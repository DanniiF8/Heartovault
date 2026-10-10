const links = [
  { href: "/collections/pumpkin_carving", label: "Pumpkin Carving" },
  { href: "/collections/gardening", label: "Gardening Catalog" },
  { href: "/collections/fishing", label: "Fish Observation" },
  { href: "/collections/cooking", label: "Gourmet Life" },
  { href: "/collections/birdwatching", label: "Birdwatching Diary" },
  { href: "/collections/insect_catching", label: "Insects Story" },
  { href: "/collections/sand_sculpture", label: "Sand Sculpting" },
  { href: "/collections/snow_sculpture", label: "Snow Sculpting" },
  { href: "/collections/ocean_cleanup", label: "Ocean Cleanup" },
  { href: "/collections/clothes", label: "Clothing & Appearance" },
  { href: "/collections/furniture", label: "Special Furniture" },
  { href: "/collections/other", label: "Other Collections" },
];

export default function CollectionsPage() {
  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24 }}>Collection</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {links.map((item) => (
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