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
  // as linhas dos pontos vêm aqui
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