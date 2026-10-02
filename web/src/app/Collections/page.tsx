const collections = [
  { href: "/Collections/Gardening", label: "Gardening" },
  { href: "/Collections/Fishing", label: "Fishing" },
  { href: "/Collections/Cooking", label: "Cooking" },
  { href: "/Collections/Birdwatching", label: "Birdwatching" },
  { href: "/Collections/Insect Catching", label: "Insect Catching" },
  { href: "/Collections/Sand Sculpture", label: "Sand Sculpture" },
  { href: "/Collections/Snow Sculpture", label: "Snow Sculpture" },
  { href: "/Collections/Ocean Cleanup", label: "Ocean Cleanup" },
  { href: "/Collections/Clothing", label: "Clothing" },
  { href: "/Collections/Furniture", label: "Furniture" },
  { href: "/Collections/World Ressources", label: "World Resources" },
  { href: "/Collections/Ingredients", label: "Ingredients" },
  { href: "/Collections/Instruments", label: "Instruments" },
  { href: "/Collections/Toys", label: "Toys" },
  { href: "/Collections/Tools", label: "Tools" },
  { href: "/Collections/Vehicles", label: "Vehicles" },
  { href: "/Collections/Items", label: "Items" },
  { href: "/Collections/CDs", label: "CDs" },
  { href: "/Collections/Puzzles", label: "Puzzles" },
  { href: "/Collections/Books", label: "Books" },
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