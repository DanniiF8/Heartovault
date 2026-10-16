// Ordem das coleções no menu e na página Collections (muda a ordem aqui, num sítio só)
export type MenuLink = { href: string; label: string; icon?: string };

export const collectionsLinks: MenuLink[] = [
  { href: "/collections/gardening", label: "Gardening", icon: "/icons/collections/gardening.webp" },
  { href: "/collections/fishing", label: "Fishing", icon: "/icons/collections/fishing.webp" },
  { href: "/collections/birdwatching", label: "Birdwatching", icon: "/icons/collections/birdwatching.webp" },
  { href: "/collections/insect_catching", label: "Insect Catching", icon: "/icons/collections/insect_catching.webp" },
  { href: "/collections/cooking", label: "Cooking", icon: "/icons/collections/cooking.webp" },
  { href: "/collections/ocean_cleanup", label: "Ocean Cleanup", icon: "/icons/collections/ocean_cleanup.webp" },
  { href: "/collections/clothes", label: "Clothes", icon: "/icons/collections/clothes.webp" },
  { href: "/collections/furniture", label: "Furniture", icon: "/icons/collections/furniture.webp" },
  { href: "/collections/other", label: "Other Collections", icon: "/icons/collections/other.webp" },
  { href: "/collections/snow_sculpture", label: "Snow Sculpture", icon: "/icons/collections/snow_sculpture.webp" },
  { href: "/collections/sand_sculpture", label: "Sand Sculpture", icon: "/icons/collections/sand_sculpture.webp" },
  { href: "/collections/pumpkin_carving", label: "Pumpkin Carving", icon: "/icons/collections/pumpkin_carving.webp" },
];