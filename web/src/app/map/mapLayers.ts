// Camadas do mapa. A "key" é o que escreves na coluna "layer" da tabela map_markers.
// Se existir o ícone /public/map/icons/<key>.png usa-se esse; senão aparece o emoji.
export const MAP_LAYERS = [
  { key: "stone_ore", label: "Stone & Ore", emoji: "🪨" },
  { key: "bamboo", label: "Bamboo", emoji: "🎋" },
  { key: "fruit_tree", label: "Fruit Trees", emoji: "🍎" },
  { key: "timber", label: "Timber", emoji: "🪵" },
  { key: "rare_timber", label: "Rare Timber", emoji: "🌲" },
  { key: "mushroom", label: "Mushrooms", emoji: "🍄" },
  { key: "truffle", label: "Black Truffles", emoji: "🟤" },
  { key: "berry_bush", label: "Berry Bushes", emoji: "🫐" },
  { key: "chest", label: "Chests", emoji: "🎁" },
];

// Imagem do mapa: guarda-a em /public/map/map.png
export const MAP_IMAGE = "/map/map.png";