const links = [
  { href: "/collections/fishing", label: "Fishing" },
  { href: "/collections/insect_catching", label: "Insect Catching" },
  { href: "/collections/birdwatching", label: "Birdwatching" },
  { href: "/collections/gardening/flowers", label: "Flowers" },
  { href: "/collections/gardening/crops", label: "Crops" },
  { href: "/collections/ocean_cleanup", label: "Ocean Cleanup" },
  { href: "/collections/cooking", label: "Cooking" },
  { href: "/collections/clothes", label: "Clothes" },
  { href: "/collections/furniture", label: "Furniture" },
  { href: "/collections/tools", label: "Tools" },
  { href: "/collections/toys", label: "Toys" },
  { href: "/collections/vehicles", label: "Vehicles" },
  { href: "/collections/instruments", label: "Instruments" },
  { href: "/collections/items", label: "Items" },
  { href: "/collections/puzzles", label: "Puzzles" },
  { href: "/collections/books", label: "Books" },
  { href: "/collections/cds", label: "CDs" },
  { href: "/collections/ingredients", label: "Ingredients" },
  { href: "/collections/world_resources", label: "World Resources" },
  { href: "/collections/sand_sculpture", label: "Sand Sculpture" },
  { href: "/collections/snow_sculpture", label: "Snow Sculpture" },
];

export default function CollectionsPage() {
  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24 }}>Collections</h1>
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