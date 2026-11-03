"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import TextBox from "../components/TextBox";
import { MAP_GROUPS, MAP_LAYERS, MAPS, LAYER_IMAGES, MARKER_IMAGES, type MapId } from "./mapLayers";
import { MARKERS, type Marker } from "./mapMarkers";
import { ZONES } from "./mapZones";
import type { Zone } from "./mapZones";
import ZonePanel, { zonesFor } from "./ZonePanel";
import type { PanelItem } from "./ZonePanel";

type View = { z: number; x: number; y: number };
type Draft = { map: MapId; layer: string; x: number; y: number };

const gold = "#e7b457";
const goldLight = "#f0c46a";
// Azul das zonas (R,G,B). Para mudar a cor, muda só estes três números.
const zoneBlue = "74,163,255";
const textShadow = "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)";
const MAX_ZOOM = 8;
// Camadas ligadas quando se abre o mapa (as outras ligam-se nos filtros).
const DEFAULT_GROUPS = ["places", "locations"];
// Camadas escondidas por agora (as gotas). Para voltar a mostrar, apaga "waters" da lista.
const HIDDEN_LAYERS = ["waters"];

function ringArea(p: [number, number][]) {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

// Área real da zona (áreas + partes - buracos)
function zoneArea(z: Zone) {
  const sum = (rs: [number, number][][]) => rs.reduce((s, r) => s + ringArea(r), 0);
  return ringArea(z.points) + sum(z.parts ?? []) - sum(z.holes ?? []);
}

// Maiores primeiro (ficam por baixo), mais pequenas por cima
const ZONES_SORTED: Zone[] = [...ZONES].sort((a, b) => zoneArea(b) - zoneArea(a));
function inRing(x: number, y: number, r: [number, number][]) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

// A zona mais pequena que contém o ponto
function zoneAtPoint(zs: Zone[], x: number, y: number): Zone | null {
  let best: Zone | null = null;
  let bestArea = Infinity;
  for (const z of zs) {
    const inside = [z.points, ...(z.parts ?? [])].some((r) => inRing(x, y, r));
    if (!inside || (z.holes ?? []).some((r) => inRing(x, y, r))) continue;
    const a = zoneArea(z);
    if (a < bestArea) {
      best = z;
      bestArea = a;
    }
  }
  return best;
}

// ---------- Editor de zonas (abre com /map?zones=1) ----------
type Pt = [number, number];
type Geo = { points: Pt[]; parts: Pt[][]; holes: Pt[][] };
type Edits = Record<string, Geo>;
const STORE_KEY = "heartovault-zone-edits";

function geoOf(z: Zone, edits: Edits): Geo {
  return edits[z.id] ?? { points: z.points, parts: z.parts ?? [], holes: z.holes ?? [] };
}

// Aplica uma alteração aos contornos de uma zona (sem mudar quantos contornos há)
function editRings(edits: Edits, zoneId: string, fn: (rs: Pt[][]) => Pt[][]): Edits {
  const z = ZONES.find((q) => q.id === zoneId);
  if (!z) return edits;
  const g = geoOf(z, edits);
  const nParts = g.parts.length;
  const rs = fn([g.points, ...g.parts, ...g.holes]);
  return { ...edits, [zoneId]: { points: rs[0], parts: rs.slice(1, 1 + nParts), holes: rs.slice(1 + nParts) } };
}

// Gera o mapZones.ts inteiro, com as alterações
function zonesFile(edits: Edits) {
  const pts = (p: Pt[]) => "[" + p.map(([x, y]) => `[${x}, ${y}]`).join(", ") + "]";
  const list = (rs: Pt[][]) => "[" + rs.map(pts).join(", ") + "]";
  const body = ZONES.map((z) => {
    const g = geoOf(z, edits);
    const lines = [
      `    id: ${JSON.stringify(z.id)},`,
      `    map: ${JSON.stringify(z.map)},`,
      `    name: ${JSON.stringify(z.name)},`,
      `    label: [${z.label[0]}, ${z.label[1]}],`,
      `    points: ${pts(g.points)},`,
    ];
    if (g.parts.length) lines.push(`    parts: ${list(g.parts)},`);
    if (g.holes.length) lines.push(`    holes: ${list(g.holes)},`);
    return `  {\n${lines.join("\n")}\n  },`;
  }).join("\n");
  return `import type { MapId } from "./mapLayers";

export type Zone = {
  id: string;
  map: MapId;
  name: string;
  label: [number, number];
  points: [number, number][];
  parts?: [number, number][][];
  holes?: [number, number][][];
};

// Pontos em % da imagem do mapa: [x, y]. As zonas maiores vêm primeiro (ficam por baixo).
// "parts" = outras áreas da mesma zona (ex.: vários lagos com o mesmo nome).
export const ZONES: Zone[] = [
${body}
];
`;
}

const MK_KEY = "heartovault-marker-edits";

// Gera o mapMarkers.ts inteiro, com as alterações (agrupado por camada)
function markersFile(list: Marker[]) {
  const order: string[] = [];
  for (const m of list) if (!order.includes(m.layer)) order.push(m.layer);
  const f = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
  const blocks = order.map((layer) => {
    const name = MAP_LAYERS.find((l) => l.key === layer)?.label ?? layer;
    const lines = list
      .filter((m) => m.layer === layer)
      .map(
        (m) =>
          `  [${JSON.stringify(m.map)}, ${JSON.stringify(layer)}, ${f(m.x)}, ${f(m.y)}${
            m.label ? `, ${JSON.stringify(m.label)}` : ""
          }],`
      );
    return `  // ${name}\n${lines.join("\n")}`;
  });
  return `import type { MapId } from "./mapLayers";

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
${blocks.join("\n\n")}
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
`;
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`ilf-pill${active ? " on" : ""}`}>
      {label}
    </button>
  );
}

// Mesmo visual dos filtros das categorias (classes ilf-*)
function FilterStyles() {
  return (
    <style>{`
      .ilf-search {
        flex: 0 1 280px;
        width: 280px;
        max-width: 100%;
        padding: 9px 16px;
        border-radius: 999px;
        border: 1px solid rgba(231,180,87,0.35);
        background: rgba(0,16,40,0.88);
        color: #e7b457;
        font-size: 1rem;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .ilf-search::placeholder { color: #e7b457; opacity: 1; }
      .ilf-search::-webkit-search-cancel-button {
        -webkit-appearance: none;
        appearance: none;
        height: 16px;
        width: 16px;
        margin-left: 6px;
        cursor: pointer;
        background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M3 3l10 10M13 3L3 13' stroke='%23f0c46a' stroke-width='2' stroke-linecap='round'/></svg>") center / contain no-repeat;
      }
      .ilf-pill {
        border: 1px solid rgba(231,180,87,0.35);
        background: rgba(0,16,40,0.88);
        color: #e7b457;
        border-radius: 999px;
        padding: 9px 18px;
        font-size: 1rem;
        font-family: inherit;
        cursor: pointer;
        text-transform: capitalize;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      }
      .ilf-pill.on {
        background: rgba(231,180,87,0.22);
        border-color: #f0c46a;
        box-shadow: 0 0 12px rgba(240,196,106,0.45);
      }
      .ilf-sel {
        padding: 9px 14px;
        border-radius: 16px;
        border: 1px solid rgba(231,180,87,0.35);
        background: rgba(0,16,40,0.88);
        color: #e7b457;
        font-size: 1rem;
        font-family: inherit;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .ilf-sel option { background: #021432; color: #e7b457; }
      .ilf-search:hover, .ilf-pill:hover, .ilf-sel:hover {
        border-color: #f0c46a;
        box-shadow: 0 0 16px rgba(240,196,106,0.6);
      }
      .ilf-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        color: #e7b457;
        font-size: 1rem;
      }
      .ilf-box {
        display: flex;
        flex-wrap: wrap;
        gap: 14px 22px;
        align-items: center;
        padding: 16px 18px;
        margin-bottom: 20px;
        border-radius: 16px;
        border: 1px solid rgba(231,180,87,0.35);
        background: rgba(0,16,40,0.88);
      }
    `}</style>
  );
}

function clampView(v: View, w: number, h: number): View {
  const z = Math.min(MAX_ZOOM, Math.max(1, v.z));
  const x = Math.min(0, Math.max(w * (1 - z), v.x));
  const y = Math.min(0, Math.max(h * (1 - z), v.y));
  return { z, x, y };
}

// Contorno redondo (curva suave por todos os pontos)
function ring(points: [number, number][]) {
  const n = points.length;
  if (n < 3) return "";
  const f = (v: number) => Math.round(v * 100) / 100;
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = f(p1[0] + (p2[0] - p0[0]) / 6);
    const c1y = f(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = f(p2[0] - (p3[0] - p1[0]) / 6);
    const c2y = f(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
}

function zonePath(z: Zone) {
  return [z.points, ...(z.parts ?? []), ...(z.holes ?? [])].map(ring).join(" ");
}

// Quais ícones PNG existem em /public/map/icons (os outros usam emoji)
function useIcons() {
  const [ok, setOk] = useState<Record<string, boolean>>({});
  useEffect(() => {
    let alive = true;
    MAP_LAYERS.forEach((l) => {
      const probe = new window.Image();
      probe.onload = () => {
        if (alive) setOk((o) => ({ ...o, [l.key]: true }));
      };
      probe.src = `/map/icons/${l.key}.png`;
    });
    return () => {
      alive = false;
    };
  }, []);
  return ok;
}

function LayerIcon({ layerKey, size = 22, ok, src }: { layerKey: string; size?: number; ok: boolean; src?: string }) {
  const info = MAP_LAYERS.find((l) => l.key === layerKey);
  const url = src ?? (ok ? `/map/icons/${layerKey}.png` : null);
  if (!url) {
    return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{info?.emoji ?? "📍"}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

export default function MapViewer({ items = [] }: { items?: PanelItem[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number } | null>(null);

  const icons = useIcons();
  const [mapId, setMapId] = useState<MapId>("island");
  const [view, setView] = useState<View>({ z: 1, x: 0, y: 0 });
  const [active, setActive] = useState<string[]>(() =>
    MAP_GROUPS.filter((g) => DEFAULT_GROUPS.includes(g.key)).flatMap((g) => g.layers.map((l) => l.key))
  );
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Marker | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [pickedZone, setPickedZone] = useState<string | null>(null);
  const [failedImg, setFailedImg] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [editLayer, setEditLayer] = useState(MAP_LAYERS[0].key);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [zoneMode, setZoneMode] = useState(false);
  const [zoneEdits, setZoneEdits] = useState<Edits>({});
  const [zeLoaded, setZeLoaded] = useState(false);
  const [editZoneId, setEditZoneId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selRing, setSelRing] = useState(0);
  const [markerMode, setMarkerMode] = useState(false);
  const [mkList, setMkList] = useState<Marker[]>(MARKERS);
  const [mkLoaded, setMkLoaded] = useState(false);
  const [selMk, setSelMk] = useState<number | null>(null);
  const [mkDragging, setMkDragging] = useState(false);
  const [mkAddLayer, setMkAddLayer] = useState(MAP_LAYERS[0].key);
  const [mkExport, setMkExport] = useState("");
  const mkDragRef = useRef<number | null>(null);
  const [exportText, setExportText] = useState("");
  const dragRef = useRef<{ zoneId: string; r: number; i: number } | null>(null);

  const currentMap = MAPS.find((m) => m.key === mapId) ?? MAPS[0];
  const imgFailed = failedImg === currentMap.image;

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setEdit(sp.get("edit") === "1");
    setZoneMode(sp.get("zones") === "1");
    setMarkerMode(sp.get("markers") === "1");
  }, []);

  // As alterações às zonas ficam guardadas no browser até as colares no mapZones.ts
  useEffect(() => {
    if (!zoneMode) return;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) setZoneEdits(JSON.parse(raw) as Edits);
    } catch {
      /* sem armazenamento */
    }
    setZeLoaded(true);
  }, [zoneMode]);

  useEffect(() => {
    if (!zoneMode || !zeLoaded) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(zoneEdits));
    } catch {
      /* sem armazenamento */
    }
  }, [zoneEdits, zoneMode, zeLoaded]);

  // As alterações aos pontos ficam guardadas no browser até as colares no mapMarkers.ts
  useEffect(() => {
    if (!markerMode) return;
    try {
      const raw = window.localStorage.getItem(MK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Marker[];
        if (Array.isArray(parsed)) setMkList(parsed);
      }
    } catch {
      /* sem armazenamento */
    }
    setMkLoaded(true);
  }, [markerMode]);

  useEffect(() => {
    if (!markerMode || !mkLoaded) return;
    try {
      window.localStorage.setItem(MK_KEY, JSON.stringify(mkList));
    } catch {
      /* sem armazenamento */
    }
  }, [mkList, markerMode, mkLoaded]);

  // Arrastar um ponto (marcador)
  useEffect(() => {
    if (!mkDragging) return;
    const onMove = (e: PointerEvent) => {
      const id = mkDragRef.current;
      const inner = innerRef.current;
      if (id === null || !inner) return;
      const r = inner.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
      const nx = Math.round(x * 10) / 10;
      const ny = Math.round(y * 10) / 10;
      setMkList((prev) => prev.map((m) => (m.id === id ? { ...m, x: nx, y: ny } : m)));
    };
    const onUp = () => {
      mkDragRef.current = null;
      setMkDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [mkDragging]);

  // Arrastar um ponto de uma zona
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      const inner = innerRef.current;
      if (!d || !inner) return;
      const r = inner.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
      const nx = Math.round(x * 100) / 100;
      const ny = Math.round(y * 100) / 100;
      setZoneEdits((prev) =>
        editRings(prev, d.zoneId, (rs) =>
          rs.map((q, qi) => (qi === d.r ? q.map((p, pi) => (pi === d.i ? ([nx, ny] as Pt) : p)) : q))
        )
      );
    };
    const onUp = () => {
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const px = clientX - r.left;
    const py = clientY - r.top;
    setView((v) => {
      const z = Math.min(MAX_ZOOM, Math.max(1, v.z * factor));
      const mx = (px - v.x) / v.z;
      const my = (py - v.y) / v.z;
      return clampView({ z, x: px - mx * z, y: py - my * z }, r.width, r.height);
    });
  }

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);

  function zoomCenter(factor: number) {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
  }

  function changeMap(id: MapId) {
    setMapId(id);
    setView({ z: 1, x: 0, y: 0 });
    setSelected(null);
    setHoverZone(null);
    setPickedZone(null);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      press.current = null;
      return;
    }
    press.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.d > 0 && d > 0) {
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinch.current.d);
      }
      pinch.current.d = d;
      return;
    }
    const p = press.current;
    const box = boxRef.current;
    if (!p || !box || p.id !== e.pointerId) return;
    const dx = e.clientX - p.sx;
    const dy = e.clientY - p.sy;
    if (!p.moved && Math.hypot(dx, dy) > 5) {
      p.moved = true;
      box.setPointerCapture(e.pointerId);
    }
    if (p.moved) {
      const r = box.getBoundingClientRect();
      setView((v) => clampView({ z: v.z, x: p.vx + dx, y: p.vy + dy }, r.width, r.height));
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const p = press.current;
    press.current = null;
    if (!p || p.moved || !edit) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const inner = innerRef.current;
    if (!inner) return;
    const r = inner.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    setDrafts((d) => [
      ...d,
      { map: mapId, layer: editLayer, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 },
    ]);
  }

  function onPointerCancel(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    press.current = null;
  }

  function toggle(key: string) {
    setActive((a) => (a.includes(key) ? a.filter((k) => k !== key) : [...a, key]));
    setSelected(null);
  }

  function setLayers(keys: string[], on: boolean) {
    setActive((a) => (on ? [...a.filter((k) => !keys.includes(k)), ...keys] : a.filter((k) => !keys.includes(k))));
    setSelected(null);
  }

  const baseMarkers = markerMode ? mkList : MARKERS;
  const mapMarkers = baseMarkers.filter(
    (m) => m.map === mapId && (markerMode || !HIDDEN_LAYERS.includes(m.layer))
  );
  const selMarker = markerMode ? mkList.find((m) => m.id === selMk) ?? null : null;
  const counts: Record<string, number> = {};
  for (const m of mapMarkers) counts[m.layer] = (counts[m.layer] ?? 0) + 1;

  const zonesAll: Zone[] = zoneMode
    ? ZONES_SORTED.map((z) => (zoneEdits[z.id] ? { ...z, ...zoneEdits[z.id] } : z))
    : ZONES_SORTED;
  const zonesHere = zonesAll.filter((z) => z.map === mapId);
  if (zonesHere.length > 0) counts["zones"] = zonesHere.length;

  const ql = q.trim().toLowerCase();
  const layerLabel = (key: string) => MAP_LAYERS.find((l) => l.key === key)?.label ?? key;
  const visible = ql
    ? mapMarkers.filter(
        (m) => (m.label ?? "").toLowerCase().includes(ql) || layerLabel(m.layer).toLowerCase().includes(ql)
      )
    : mapMarkers.filter((m) => active.includes(m.layer));
  // Pesquisa: acende as zonas onde está a ave/peixe/inseto, ou a zona do ponto (NPC, loja...)
  const searchZones = new Set<string>();
  if (ql.length >= 2) {
    for (const it of items) {
      if (it.name.toLowerCase().includes(ql)) {
        for (const zid of zonesFor(it)) searchZones.add(zid);
      }
    }
    for (const m of mapMarkers) {
      if (m.label && m.label.toLowerCase().includes(ql)) {
        const z = zoneAtPoint(zonesHere, m.x, m.y);
        if (z) searchZones.add(z.id);
      }
    }
  }
  const zonesOn = zonesHere.length > 0;
  const zoneMatches = (z: Zone) => ql.length > 0 && z.name.toLowerCase().includes(ql);
  const zoneLit = (z: Zone) => z.id === hoverZone || z.id === pickedZone || zoneMatches(z) || searchZones.has(z.id);
  const litZones = zonesOn ? zonesHere.filter(zoneLit) : [];

  const groupsToShow = MAP_GROUPS.map((g) => ({
    ...g,
    layers: g.layers.filter((l) => edit || counts[l.key]),
  })).filter((g) => g.layers.length > 0);
  const allKeys = groupsToShow.flatMap((g) => g.layers.map((l) => l.key));
  const editZone = zoneMode ? zonesHere.find((z) => z.id === editZoneId) ?? null : null;
  const editRingList: Pt[][] = editZone ? [editZone.points, ...(editZone.parts ?? []), ...(editZone.holes ?? [])] : [];
  const editParts = editZone?.parts?.length ?? 0;
  const ringColor = (r: number) => (r === 0 ? goldLight : r <= editParts ? "#6fe3ff" : "#ff7a7a");
  const handleStyle = (x: number, y: number, size: number, bg: string, border: string): CSSProperties => ({
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    boxSizing: "border-box",
    borderRadius: "50%",
    background: bg,
    border: `2px solid ${border}`,
    transform: `translate(-50%, -50%) scale(${1 / view.z})`,
    cursor: "move",
    touchAction: "none",
  });

  function startDrag(zoneId: string, r: number, i: number) {
    dragRef.current = { zoneId, r, i };
    setSelRing(r);
    setDragging(true);
  }

  // Acrescenta uma área nova (quadradinho) à zona, no sítio da etiqueta
  function addArea(zoneId: string) {
    setZoneEdits((prev) => {
      const z = ZONES.find((q) => q.id === zoneId);
      if (!z) return prev;
      const g = geoOf(z, prev);
      const [cx, cy] = z.label;
      const s = 1.5;
      const sq: Pt[] = [
        [cx - s, cy - s],
        [cx + s, cy - s],
        [cx + s, cy + s],
        [cx - s, cy + s],
      ];
      return { ...prev, [zoneId]: { ...g, parts: [...g.parts, sq] } };
    });
    setSelRing(editZone ? 1 + (editZone.parts?.length ?? 0) : 0);
  }

  // Apaga a área selecionada (a de pontos maiores/destacados)
  function deleteArea(zoneId: string, r: number) {
    setZoneEdits((prev) => {
      const z = ZONES.find((q) => q.id === zoneId);
      if (!z) return prev;
      const g = geoOf(z, prev);
      const nParts = g.parts.length;
      if (r === 0) {
        if (nParts === 0) return prev;
        return { ...prev, [zoneId]: { points: g.parts[0], parts: g.parts.slice(1), holes: g.holes } };
      }
      if (r <= nParts) {
        return { ...prev, [zoneId]: { ...g, parts: g.parts.filter((_, k) => k !== r - 1) } };
      }
      return { ...prev, [zoneId]: { ...g, holes: g.holes.filter((_, k) => k !== r - 1 - nParts) } };
    });
    setSelRing(0);
  }

  function deleteVertex(zoneId: string, r: number, i: number) {
    setZoneEdits((prev) =>
      editRings(prev, zoneId, (rs) =>
        rs.map((q, qi) => (qi === r && q.length > 3 ? q.filter((_, k) => k !== i) : q))
      )
    );
  }

  function exportZones() {
    const text = zonesFile(zoneEdits);
    setExportText(text);
    navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  // Acrescenta um ponto novo no centro do que estás a ver (depois arrastas)
  function addMarker() {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    const b = box.getBoundingClientRect();
    const r = inner.getBoundingClientRect();
    const cl = (v: number) => Math.min(100, Math.max(0, v));
    const x = Math.round(cl(((b.left + b.width / 2 - r.left) / r.width) * 100) * 10) / 10;
    const y = Math.round(cl(((b.top + b.height / 2 - r.top) / r.height) * 100) * 10) / 10;
    const id = mkList.reduce((mx, m) => Math.max(mx, m.id), 0) + 1;
    const layer = mkAddLayer;
    setMkList((prev) => [...prev, { id, map: mapId, layer, label: null, x, y, note: null }]);
    setActive((a) => (a.includes(layer) ? a : [...a, layer]));
    setSelMk(id);
  }

  function changeMarkerLayer(layer: string) {
    if (selMk === null) return;
    const id = selMk;
    setMkList((prev) => prev.map((m) => (m.id === id ? { ...m, layer } : m)));
    setActive((a) => (a.includes(layer) ? a : [...a, layer]));
  }

  function changeMarkerLabel(v: string) {
    if (selMk === null) return;
    const id = selMk;
    setMkList((prev) => prev.map((m) => (m.id === id ? { ...m, label: v === "" ? null : v } : m)));
  }

  function deleteMarker() {
    if (selMk === null) return;
    const id = selMk;
    setMkList((prev) => prev.filter((m) => m.id !== id));
    setSelMk(null);
  }

  function resetMarkers() {
    if (!window.confirm("Reset all points back to the saved file? Your edits in this browser will be lost.")) return;
    setMkList(MARKERS);
    setSelMk(null);
    setMkExport("");
  }

  function exportMarkers() {
    const text = markersFile(mkList);
    setMkExport(text);
    navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  const layerOptions = MAP_GROUPS.map((g) => (
    <optgroup key={g.key} label={g.label}>
      {g.layers.map((l) => (
        <option key={l.key} value={l.key}>
          {l.label}
        </option>
      ))}
    </optgroup>
  ));

  const csv = drafts.map((d) => `  ["${d.map}", "${d.layer}", ${d.x}, ${d.y}],`).join("\n");

  return (
    <div>
      <FilterStyles />
      <style>{`
        .mp-zoom { min-width: 38px; height: 38px; padding: 0 8px !important; justify-content: center; font-size: 1.2rem !important; display: inline-flex; align-items: center; }
        .mp-layer { display: inline-flex; align-items: center; gap: 6px; }
        .mp-small { padding: 5px 12px !important; font-size: 0.9rem !important; }
        .mp-zone { transition: fill 0.15s ease, stroke 0.15s ease; }
      `}</style>

      {/* Uma linha: mapas / pesquisa / filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        {MAPS.map((m) => (
          <Pill key={m.key} active={mapId === m.key} label={m.label} onClick={() => changeMap(m.key)} />
        ))}
        <input
          type="search"
          className="ilf-search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelected(null);
            setPickedZone(null);
          }}
          placeholder="Search map..."
        />
        <Pill active={open} label="Filters" onClick={() => setOpen((v) => !v)} />
      </div>

      {open && (
        <div className="ilf-box" style={{ flexDirection: "column", alignItems: "stretch", gap: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: gold, fontSize: "1.1rem" }}>Show</span>
            <Pill active={false} label="All" onClick={() => setLayers(allKeys, true)} />
            <Pill active={false} label="None" onClick={() => setLayers(allKeys, false)} />
          </div>

          {groupsToShow.map((g) => {
            const keys = g.layers.map((l) => l.key);
            return (
              <div key={g.key}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: gold, fontSize: "1.15rem" }}>{g.label}</span>
                  <button type="button" className="ilf-pill mp-small" onClick={() => setLayers(keys, true)}>
                    All
                  </button>
                  <button type="button" className="ilf-pill mp-small" onClick={() => setLayers(keys, false)}>
                    None
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {g.layers.map((l) => {
                    const on = active.includes(l.key);
                    return (
                      <button
                        key={l.key}
                        type="button"
                        onClick={() => toggle(l.key)}
                        aria-pressed={on}
                        className={`ilf-pill mp-layer${on ? " on" : ""}`}
                      >
                        <LayerIcon layerKey={l.key} size={18} ok={!!icons[l.key]} src={LAYER_IMAGES[l.key]} />
                        {l.label} {counts[l.key] ? `(${counts[l.key]})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
<div style={{ flex: "3 1 520px", minWidth: 0 }}>
      <TextBox raw>
        <div style={{ width: "100%" }}>
          <div
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{
              position: "relative",
              overflow: "hidden",
              touchAction: "none",
              borderRadius: 10,
              cursor: edit ? "crosshair" : "grab",
              width: "100%",
            }}
          >
            <div
              ref={innerRef}
              style={{
                position: "relative",
                transformOrigin: "0 0",
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
              }}
            >
              {imgFailed ? (
                <div style={{ padding: 40, color: gold, textShadow }}>
                  Map image not found. Save it as <code>public{currentMap.image}</code>.
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentMap.image}
                  alt={currentMap.label}
                  draggable={false}
                  onError={() => setFailedImg(currentMap.image)}
                  style={{ display: "block", width: "100%", height: "auto", userSelect: "none" }}
                />
              )}

              {/* Zonas: invisíveis; só a zona em hover (ou tocada) fica azul com contorno dourado */}
              {zonesOn && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
                >
                  {zonesHere.map((z) => {
                    const lit = zoneLit(z);
                    return (
                      <path
                        key={z.id}
                        className="mp-zone"
                        d={zonePath(z)}
                        fillRule="evenodd"
                        pointerEvents="all"
                        fill={lit ? `rgba(${zoneBlue},0.32)` : "transparent"}
                        stroke={lit ? goldLight : "transparent"}
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                        style={lit ? { filter: "drop-shadow(0 0 4px rgba(240,196,106,0.9))" } : undefined}
                        onPointerEnter={(e) => {
                          if (e.pointerType === "mouse") setHoverZone(z.id);
                        }}
                        onPointerLeave={(e) => {
                          if (e.pointerType === "mouse") setHoverZone((h) => (h === z.id ? null : h));
                        }}
                        onClick={() => {
                          if (zoneMode) {
                            setEditZoneId(z.id);
                            setSelRing(0);
                          } else {
                            setSelected(null);
                            setPickedZone((p) => (p === z.id ? null : z.id));
                          }
                        }}
                      />
                    );
                  })}
                </svg>
              )}

              {zoneMode && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                >
                  {zonesHere.map((z) => (
                    <path
                      key={`${z.id}-outline`}
                      d={zonePath(z)}
                      fillRule="evenodd"
                      fill={z.id === editZoneId ? `rgba(${zoneBlue},0.25)` : "none"}
                      stroke={z.id === editZoneId ? goldLight : "rgba(240,196,106,0.4)"}
                      strokeWidth={z.id === editZoneId ? 2 : 1}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              )}

              {editZone &&
                editRingList.map((rg, r) => (
                  <Fragment key={`ring-${editZone.id}-${r}`}>
                    {rg.map((p, i) => {
                      const nx = rg[(i + 1) % rg.length];
                      const mx = Math.round(((p[0] + nx[0]) / 2) * 100) / 100;
                      const my = Math.round(((p[1] + nx[1]) / 2) * 100) / 100;
                      return (
                        <div
                          key={`m${i}`}
                          title="Drag to add a point"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setZoneEdits((prev) =>
                              editRings(prev, editZone.id, (rs) =>
                                rs.map((q, qi) =>
                                  qi === r ? [...q.slice(0, i + 1), [mx, my] as Pt, ...q.slice(i + 1)] : q
                                )
                              )
                            );
                            startDrag(editZone.id, r, i + 1);
                          }}
                          style={handleStyle(mx, my, 9, "rgba(255,255,255,0.6)", "rgba(0,0,0,0.5)")}
                        />
                      );
                    })}
                    {rg.map((p, i) => (
                      <div
                        key={`v${i}`}
                        title="Drag to move, double-click to delete"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          startDrag(editZone.id, r, i);
                        }}
                        onDoubleClick={() => deleteVertex(editZone.id, r, i)}
                        style={handleStyle(p[0], p[1], r === selRing ? 20 : 14, ringColor(r), "#000")}
                      />
                    ))}
                  </Fragment>
                ))}

              {litZones.map((z) => (
                <div
                  key={`${z.id}-label`}
                  style={{
                    position: "absolute",
                    left: `${z.label[0]}%`,
                    top: `${z.label[1]}%`,
                    transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                    whiteSpace: "nowrap",
                    zIndex: 5,
                    pointerEvents: "none",
                    color: gold,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textShadow,
                  }}
                >
                  {z.name}
                </div>
              ))}

              {visible.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    if (!markerMode) {
                      setSelected(m);
                      setPickedZone(null);
                    }
                  }}
                  onPointerDown={(e) => {
                    if (!markerMode) return;
                    e.stopPropagation();
                    e.preventDefault();
                    mkDragRef.current = m.id;
                    setSelMk(m.id);
                    setMkDragging(true);
                  }}
                  title={m.label ?? layerLabel(m.layer)}
                  style={{
                    position: "absolute",
                    left: `${m.x}%`,
                    top: `${m.y}%`,
                    transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: markerMode ? "move" : "pointer",
                    touchAction: markerMode ? "none" : undefined,
                    borderRadius: "50%",
                    outline: markerMode && selMk === m.id ? `2px solid ${goldLight}` : "none",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                  }}
                >
                  <LayerIcon layerKey={m.layer} ok={!!icons[m.layer]} src={(m.label ? MARKER_IMAGES[m.label] : undefined) ?? LAYER_IMAGES[m.layer]} />
                </button>
              ))}

              {edit &&
                drafts
                  .filter((d) => d.map === mapId)
                  .map((d, i) => (
                    <span
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: goldLight,
                        border: "2px solid #fff",
                        transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
            </div>

            <div style={{ position: "absolute", right: 10, top: 10, display: "grid", gap: 6 }}>
              <button type="button" onClick={() => zoomCenter(1.5)} className="ilf-pill mp-zoom" aria-label="Zoom in">
                +
              </button>
              <button type="button" onClick={() => zoomCenter(1 / 1.5)} className="ilf-pill mp-zoom" aria-label="Zoom out">
                −
              </button>
              <button
                type="button"
                onClick={() => setView({ z: 1, x: 0, y: 0 })}
                className="ilf-pill mp-zoom"
                aria-label="Reset view"
              >
                ⟲
              </button>
            </div>
          </div>
        </div>
      </TextBox>
      </div>
      <div style={{ flex: "1 1 280px", minWidth: 0 }}>
        {selected && (
          <div style={{ marginBottom: 16 }}>
            <TextBox raw>
              <div className="tb-label">{selected.label || layerLabel(selected.layer)}</div>
              {selected.note && <div className="tb-value">{selected.note}</div>}
            </TextBox>
          </div>
        )}
        {(!selected || ["event_butterfly", "event_bird", "event_fish"].includes(selected.layer)) && (
          <ZonePanel
            zoneId={pickedZone}
            items={items}
            eventLayer={
              selected && ["event_butterfly", "event_bird", "event_fish"].includes(selected.layer)
                ? selected.layer
                : null
            }
            eventTitle={selected ? selected.label || layerLabel(selected.layer) : ""}
          />
        )}
      </div>
      </div>

      {zoneMode && (
        <div style={{ marginTop: 18 }}>
          <div style={{ color: gold, textShadow, fontSize: "1.1rem", marginBottom: 8 }}>
            Zone editor: click a zone on the map (or pick it here), then drag its points. Double-click a point to delete it.
            Drag a small white dot to add a point.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <select
              value={editZoneId ?? ""}
              onChange={(e) => {
                setEditZoneId(e.target.value || null);
                setSelRing(0);
              }}
              className="ilf-sel"
            >
              <option value="">— pick a zone —</option>
              {zonesHere.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.id})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ilf-pill mp-small"
              onClick={() => {
                if (editZoneId) addArea(editZoneId);
              }}
            >
              Add area
            </button>
            <button
              type="button"
              className="ilf-pill mp-small"
              onClick={() => {
                if (editZoneId) deleteArea(editZoneId, Math.min(selRing, editRingList.length - 1));
              }}
            >
              Delete area
            </button>
            <button
              type="button"
              className="ilf-pill mp-small"
              onClick={() => {
                if (!editZoneId) return;
                setZoneEdits((prev) => {
                  const n = { ...prev };
                  delete n[editZoneId];
                  return n;
                });
              }}
            >
              Reset this zone
            </button>
            <button
              type="button"
              className="ilf-pill mp-small"
              onClick={() => {
                setZoneEdits({});
                setExportText("");
              }}
            >
              Reset all
            </button>
            <button type="button" className="ilf-pill mp-small on" onClick={exportZones}>
              Copy new mapZones.ts
            </button>
          </div>
          <div style={{ color: gold, textShadow, fontSize: "0.95rem", marginBottom: 8 }}>
            {Object.keys(zoneEdits).length} zone(s) edited. Edits stay in this browser until you paste the new file.
          </div>
          {exportText && (
            <textarea
              readOnly
              value={exportText}
              rows={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(0,16,40,0.88)",
                color: gold,
                border: "1px solid rgba(231,180,87,0.35)",
                borderRadius: 10,
                padding: 8,
                fontFamily: "inherit",
              }}
            />
          )}
        </div>
      )}

      {markerMode && (
        <div style={{ marginTop: 18 }}>
          <div style={{ color: gold, textShadow, fontSize: "1.1rem", marginBottom: 8 }}>
            Point editor: drag a point to move it, click it to select it. Open Filters to show the layers you want to edit.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <select value={mkAddLayer} onChange={(e) => setMkAddLayer(e.target.value)} className="ilf-sel">
              {layerOptions}
            </select>
            <button type="button" className="ilf-pill mp-small" onClick={addMarker}>
              Add point
            </button>
            <button type="button" className="ilf-pill mp-small" onClick={resetMarkers}>
              Reset all
            </button>
            <button type="button" className="ilf-pill mp-small on" onClick={exportMarkers}>
              Copy new mapMarkers.ts
            </button>
          </div>
          {selMarker ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: gold, textShadow }}>Selected:</span>
              <select value={selMarker.layer} onChange={(e) => changeMarkerLayer(e.target.value)} className="ilf-sel">
                {layerOptions}
              </select>
              <input
                type="text"
                className="ilf-search"
                value={selMarker.label ?? ""}
                onChange={(e) => changeMarkerLabel(e.target.value)}
                placeholder="Name (optional)"
              />
              <button type="button" className="ilf-pill mp-small" onClick={deleteMarker}>
                Delete point
              </button>
            </div>
          ) : (
            <div style={{ color: gold, textShadow, fontSize: "0.95rem", marginBottom: 10 }}>
              Click a point to select it.
            </div>
          )}
          <div style={{ color: gold, textShadow, fontSize: "0.95rem", marginBottom: 8 }}>
            {mkList.length} points in total. Edits stay in this browser until you paste the new file.
          </div>
          {mkExport && (
            <textarea
              readOnly
              value={mkExport}
              rows={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(0,16,40,0.88)",
                color: gold,
                border: "1px solid rgba(231,180,87,0.35)",
                borderRadius: 10,
                padding: 8,
                fontFamily: "inherit",
              }}
            />
          )}
        </div>
      )}

      {edit && (
        <div style={{ marginTop: 18 }}>
          <div style={{ color: gold, textShadow, fontSize: "1.1rem", marginBottom: 8 }}>
            Pick a layer, then click the map to add points
          </div>
          <select value={editLayer} onChange={(e) => setEditLayer(e.target.value)} className="ilf-sel" style={{ marginBottom: 10 }}>
            {MAP_GROUPS.map((g) => (
              <optgroup key={g.key} label={g.label}>
                {g.layers.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <textarea
            readOnly
            value={csv}
            rows={8}
            placeholder='["island", "stone", 12.3, 45.6],'
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "rgba(0,16,40,0.88)",
              color: gold,
              border: "1px solid rgba(231,180,87,0.35)",
              borderRadius: 10,
              padding: 8,
              fontFamily: "inherit",
            }}
          />
          <div style={{ color: gold, textShadow, fontSize: "0.95rem", margin: "6px 0 10px" }}>
            Copy these lines into mapMarkers.ts, inside the list.
          </div>
          <button type="button" onClick={() => setDrafts([])} className="ilf-pill mp-small">
            Clear points
          </button>
        </div>
      )}
    </div>
  );
}
