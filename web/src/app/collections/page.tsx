const links = [
  { href: "/collections/pumpkin_carving", label: "Pumpkin Carving" },
  { href: "/collections/gardening", label: "Gardening" },
  { href: "/collections/fishing", label: "Fishing" },
  { href: "/collections/cooking", label: "Cooking" },
  { href: "/collections/birdwatching", label: "Birdwatching" },
  { href: "/collections/insect_catching", label: "Insect Catching" },
  { href: "/collections/sand_sculpture", label: "Sand Sculpture" },
  { href: "/collections/snow_sculpture", label: "Snow Sculpture" },
  { href: "/collections/ocean_cleanup", label: "Ocean Cleanup" },
  { href: "/collections/clothes", label: "Clothes" },
  { href: "/collections/furniture", label: "Furniture" },
  { href: "/collections/other", label: "Other Collections" },
];

export default function CollectionsPage() {
  return (
    <main style={{ padding: "96px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>
        Collection
      </h1>
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