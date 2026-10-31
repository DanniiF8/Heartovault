import type { MapId } from "./mapLayers";

export type Marker = {
  id: number;
  map: MapId;
  layer: string;
  label: string | null;
  x: number;
  y: number;
  note: string | null;
};

// Uma linha por ponto: [mapa, camada, x, y, nome (opcional)]
// x e y são em % da imagem. O mapa é "island" ou "whale".
type RawMarker = [MapId, string, number, number, string?];

const RAW: RawMarker[] = [
  // Stone
  ["island", "stone", 43.8, 25.2],
  ["island", "stone", 34.2, 25.6],
  ["island", "stone", 53.6, 28.2],
  ["island", "stone", 61.1, 29.3],
  ["island", "stone", 38.3, 32.1],
  ["island", "stone", 43.2, 32.4],
  ["island", "stone", 46.3, 33.0],
  ["island", "stone", 36.3, 33.0],
  ["island", "stone", 49.4, 34.1],
  ["island", "stone", 53.4, 34.9],
  ["island", "stone", 58.4, 35.8],
  ["island", "stone", 61.2, 36.6],
  ["island", "stone", 65.7, 39.8],
  ["island", "stone", 72.7, 40.6],
  ["island", "stone", 30.7, 40.8],
  ["island", "stone", 65.9, 43.0],
  ["island", "stone", 24.2, 43.4],
  ["island", "stone", 31.2, 44.4],
  ["island", "stone", 65.8, 45.8],
  ["island", "stone", 72.8, 47.3],
  ["island", "stone", 31.6, 48.0],
  ["island", "stone", 65.9, 48.3],
  ["island", "stone", 24.6, 50.9],
  ["island", "stone", 32.2, 51.0],
  ["island", "stone", 65.2, 53.2],
  ["island", "stone", 32.0, 53.4],
  ["island", "stone", 73.0, 55.5],
  ["island", "stone", 64.8, 55.8],
  ["island", "stone", 25.9, 57.1],
  ["island", "stone", 33.0, 57.6],
  ["island", "stone", 34.5, 60.5],
  ["island", "stone", 63.3, 60.7],
  ["island", "stone", 36.5, 62.8],
  ["island", "stone", 62.8, 63.1],
  ["island", "stone", 29.1, 65.3],
  ["island", "stone", 70.3, 65.9],
  // Ore
  ["island", "ore", 36.1, 24.4],
  ["island", "ore", 47.0, 25.9],
  ["island", "ore", 39.9, 27.6],
  ["island", "ore", 54.3, 28.1],
  ["island", "ore", 63.4, 29.8],
  ["island", "ore", 47.7, 30.5],
  ["island", "ore", 56.5, 31.1],
  ["island", "ore", 72.7, 38.6],
  ["island", "ore", 23.9, 40.4],
  ["island", "ore", 69.5, 43.9],
  ["island", "ore", 29.1, 46.3],
  ["island", "ore", 72.7, 46.4],
  ["island", "ore", 24.4, 49.6],
  ["island", "ore", 71.0, 51.6],
  ["island", "ore", 29.0, 53.1],
  ["island", "ore", 25.4, 55.8],
  ["island", "ore", 72.7, 56.4],
  ["island", "ore", 67.9, 60.4],
  ["island", "ore", 31.1, 61.4],
  ["island", "ore", 27.9, 63.7],
  ["island", "ore", 68.7, 67.0],
];

export const MARKERS: Marker[] = RAW.map(([map, layer, x, y, label], i) => ({
  id: i + 1,
  map,
  layer,
  x,
  y,
  label: label ?? null,
  note: null,
}));