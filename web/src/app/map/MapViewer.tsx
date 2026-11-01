"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import TextBox from "../components/TextBox";
import { MAP_GROUPS, MAP_LAYERS, MAPS, type MapId } from "./mapLayers";
import { MARKERS, type Marker } from "./mapMarkers";
import { ZONES } from "./mapZones";
import type { Zone } from "./mapZones";

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

function LayerIcon({ layerKey, size = 22, ok }: { layerKey: string; size?: number; ok: boolean }) {
  const info = MAP_LAYERS.find((l) => l.key === layerKey);
  if (!ok) {
    return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{info?.emoji ?? "📍"}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/map/icons/${layerKey}.png`}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

export default function MapViewer() {
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

  const currentMap = MAPS.find((m) => m.key === mapId) ?? MAPS[0];
  const imgFailed = failedImg === currentMap.image;

  useEffect(() => {
    setEdit(new URLSearchParams(window.location.search).get("edit") === "1");
  }, []);

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

  const mapMarkers = MARKERS.filter((m) => m.map === mapId);
  const counts: Record<string, number> = {};
  for (const m of mapMarkers) counts[m.layer] = (counts[m.layer] ?? 0) + 1;

  const zonesHere = ZONES.filter((z) => z.map === mapId);
  if (zonesHere.length > 0) counts["zones"] = zonesHere.length;

  const ql = q.trim().toLowerCase();
  const layerLabel = (key: string) => MAP_LAYERS.find((l) => l.key === key)?.label ?? key;
  const visible = ql
    ? mapMarkers.filter(
        (m) => (m.label ?? "").toLowerCase().includes(ql) || layerLabel(m.layer).toLowerCase().includes(ql)
      )
    : mapMarkers.filter((m) => active.includes(m.layer));

  const zonesOn = zonesHere.length > 0 && (active.includes("zones") || ql.length > 0);
  const zoneMatches = (z: Zone) => ql.length > 0 && z.name.toLowerCase().includes(ql);
  const zoneLit = (z: Zone) => z.id === hoverZone || z.id === pickedZone || zoneMatches(z);
  const litZones = zonesOn ? zonesHere.filter(zoneLit) : [];

  const groupsToShow = MAP_GROUPS.map((g) => ({
    ...g,
    layers: g.layers.filter((l) => edit || counts[l.key]),
  })).filter((g) => g.layers.length > 0);
  const allKeys = groupsToShow.flatMap((g) => g.layers.map((l) => l.key));
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
                        <LayerIcon layerKey={l.key} size={18} ok={!!icons[l.key]} />
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
                        onClick={() => setPickedZone((p) => (p === z.id ? null : z.id))}
                      />
                    );
                  })}
                </svg>
              )}

              {litZones.map((z) => (
                <div
                  key={`${z.id}-label`}
                  style={{
                    position: "absolute",
                    left: `${z.label[0]}%`,
                    top: `${z.label[1]}%`,
                    transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                    whiteSpace: "nowrap",
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
                  onClick={() => setSelected(m)}
                  title={m.label ?? layerLabel(m.layer)}
                  style={{
                    position: "absolute",
                    left: `${m.x}%`,
                    top: `${m.y}%`,
                    transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                  }}
                >
                  <LayerIcon layerKey={m.layer} ok={!!icons[m.layer]} />
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

      {selected && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <TextBox raw wide>
            <div className="tb-label">{selected.label || layerLabel(selected.layer)}</div>
            {selected.label && <div className="tb-value">{layerLabel(selected.layer)}</div>}
            {selected.note && <div className="tb-value">{selected.note}</div>}
          </TextBox>
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
