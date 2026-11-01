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
// Vazio por agora: as zonas novas são geradas a partir de capturas (ver conversa).
export const ZONES: Zone[] = [];
