import type { MapId } from "./mapLayers";

export type Zone = {
  id: string;
  map: MapId;
  name: string;
  label: [number, number];
  points: [number, number][];
  holes?: [number, number][][];
};

// Pontos em % da imagem do mapa: [x, y]. As zonas maiores vêm primeiro (ficam por baixo).
export const ZONES: Zone[] = [];