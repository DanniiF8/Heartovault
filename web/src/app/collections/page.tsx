const collections = [
  { href: "/collections/gardening", label: "Gardening" },
  { href: "/collections/fishing", label: "Fishing" },
  { href: "/collections/cooking", label: "Cooking" },
  { href: "/collections/birdwatching", label: "Birdwatching" },
  { href: "/collections/insect_catching", label: "Insect Catching" },
  { href: "/collections/sand_sculpture", label: "Sand Sculpture" },
  { href: "/collections/snow_sculpture", label: "Snow Sculpture" },
  { href: "/collections/ocean_cleanup", label: "Ocean Cleanup" },
  { href: "/collections/clothing", label: "Clothing" },
  { href: "/collections/furniture", label: "Furniture" },
  { href: "/collections/world_ressources", label: "World Resources" },
  { href: "/collections/ingredients", label: "Ingredients" },
  { href: "/collections/instruments", label: "Instruments" },
  { href: "/collections/toys", label: "Toys" },
  { href: "/collections/tools", label: "Tools" },
  { href: "/collections/vehicles", label: "Vehicles" },
  { href: "/collections/items", label: "Items" },
  { href: "/collections/cds", label: "CDs" },
  { href: "/collections/puzzles", label: "Puzzles" },
  { href: "/collections/books", label: "Books" },
];

export default function CollectionsPage() {
  return (
    <main>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "24px" }}>Collections</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {collections.map((c) => (
          <a
            key={c.href}
            href={c.href}
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "#1e3a5f",
              color: "#e8f4ff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            {c.label}
          </a>
        ))}
      </div>
    </main>
  );
}