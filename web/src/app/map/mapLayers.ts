// Camadas do mapa, por grupos. A "key" de cada camada é o que escreves na coluna "layer" da tabela map_markers.
// Se existir o ícone /public/map/icons/<key>.png usa-se esse; senão aparece o emoji.
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
    key: "locations",
    label: "Locations",
    layers: [
      { key: "zones", label: "Zones", emoji: "📍" },
      { key: "waters", label: "Lakes & Rivers", emoji: "💧" },
    ],
  },
  {
    key: "events",
    label: "Events",
    layers: [
      { key: "event_butterfly", label: "Butterfly", emoji: "🦋" },
      { key: "event_bird", label: "Bird", emoji: "🐦" },
      { key: "event_fish", label: "Fish", emoji: "🐟" },
      { key: "event_balloon", label: "Balloon", emoji: "🎈" },
      { key: "event_whale_skeleton", label: "Whale Skeleton", emoji: "🦴" },
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

// Os dois mapas (as imagens estão em /public/backgrounds/).
export const MAPS = [
  { key: "island", label: "Island", image: "/backgrounds/map2.webp" },
  { key: "whale", label: "Whalefall Canyon", image: "/backgrounds/whale.webp" },
] as const;

export type MapId = (typeof MAPS)[number]["key"];