// Camadas do mapa, por grupos. A "key" de cada camada é o que escreves na coluna "layer" da tabela map_markers.

export type MapLayer = { key: string; label: string; emoji: string };

export type MapGroup = { key: string; label: string; layers: MapLayer[] };

export const MAP_GROUPS: MapGroup[] = [
  {
    key: "places",
    label: "Places",
    layers: [
      { key: "stores", label: "Stores", emoji: "🏪" },
      { key: "bus_stop", label: "Bus Stop", emoji: "🚌" },
    ],
  },
  {
    key: "events",
    label: "Events",
    layers: [
      { key: "event_butterfly", label: "Bait the Insects", emoji: "🦋" },
      { key: "event_bird", label: "Nest of Hundreds", emoji: "🐦" },
      { key: "event_fish", label: "Sea Fishing", emoji: "🐟" },
      { key: "event_balloon", label: "Hot Air Balloon", emoji: "🎈" },
      { key: "event_whale_skeleton", label: "Ocean Cleanup", emoji: "🦴" },
    ],
  },
  {
    key: "animals",
    label: "Animals",
    layers: [{ key: "animals", label: "Animals", emoji: "🐾" }],
  },
  {
    key: "resources",
    label: "Resources",
    layers: [
      { key: "stone", label: "Stone", emoji: "🪨" },
      { key: "ore", label: "Ore", emoji: "⛏️" },
      { key: "bamboo", label: "Bamboo", emoji: "🎋" },
      { key: "timber", label: "Timber", emoji: "🪵" },
      { key: "rare_timber", label: "Rare Timber", emoji: "🌲" },
      { key: "apple", label: "Apple", emoji: "🍎" },
      { key: "mandarin", label: "Mandarin", emoji: "🍊" },
      { key: "blueberry", label: "Blueberry", emoji: "🫐" },
      { key: "raspberry", label: "Raspberry", emoji: "🍓" },
      { key: "oyster_mushroom", label: "Oyster Mushroom", emoji: "🍄" },
      { key: "shiitake", label: "Shiitake", emoji: "🍄" },
      { key: "button_mushroom", label: "Button Mushroom", emoji: "🍄" },
      { key: "honey_mushroom", label: "Honey Mushroom", emoji: "🍄" },
      { key: "penny_bun", label: "Penny Bun", emoji: "🍄" },
      { key: "black_truffle", label: "Black Truffle", emoji: "🟤" },
      { key: "glasswort", label: "Glasswort", emoji: "🌿" },
      { key: "sea_grape", label: "Sea Grape", emoji: "🍇" },
      { key: "wakame", label: "Wakame", emoji: "🌊" },
    ],
  },
  {
    key: "npcs",
    label: "NPCs",
    layers: [{ key: "npcs", label: "NPCs", emoji: "🧑" }],
  },
];

export const MAP_LAYERS: MapLayer[] = MAP_GROUPS.flatMap((g) => g.layers);

// Imagens por camada (as camadas que não estão aqui usam o emoji).
export const LAYER_IMAGES: Record<string, string> = {
  event_butterfly: "/icons/collections/insect_catching.webp",
  event_bird: "/icons/collections/birdwatching.webp",
  event_fish: "/icons/collections/fishing.webp",
  event_whale_skeleton: "/icons/collections/ocean_cleanup.webp",
};

// Imagens por ponto, pelo nome exato do ponto (as lojas que não estão aqui usam o emoji).
export const MARKER_IMAGES: Record<string, string> = {
  "Bob's Furniture Store": "/icons/shops/furniture_store.webp",
  "Order Machine": "/icons/shops/order_machine.webp",
  "Lab": "/icons/shops/lab.webp",
  "Bailley J's Birdwatching Store": "/icons/shops/birdwatching_store.webp",
  "Ka Ching's General Store": "/icons/shops/ka_ching_general_store.webp",
  "Massimo's Cooking Store": "/icons/shops/cooking_store.webp",
  "Vanya's Fishing Store": "/icons/shops/fishing_store.webp",
  "Mrs. Joan's Pets Store": "/icons/shops/pet_store.webp",
  "Naniwa's Insect Catching Store": "/icons/shops/insect_catching_store.webp",
  "Blanc's Gardening Store": "/icons/shops/gardening_store.webp",
};

// Os dois mapas (as imagens estão em /public/backgrounds/).
export const MAPS = [
  { key: "island", label: "Island", image: "/backgrounds/map2.webp" },
  { key: "whale", label: "Whalefall Canyon", image: "/backgrounds/whale.webp" },
] as const;

export type MapId = (typeof MAPS)[number]["key"];