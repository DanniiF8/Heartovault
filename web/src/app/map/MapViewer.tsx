"use client";

import { useEffect, useRef, useState } from "react";
import TextBox from "../components/TextBox";
import { MAP_GROUPS, MAP_LAYERS, MAPS, type MapId } from "./mapLayers";
import { MARKERS, type Marker } from "./mapMarkers";
import { ZONES, type Zone } from "./mapZones";

type View = { z: number; x: number; y: number };
type Draft = { map: MapId; layer: string; x: number; y: number };
type ZoneDraft = { map: MapId; name: string; points: [number, number][]; label: [number, number] };

const gold = "#e7b457";
// Azul das zonas (R,G,B). Para mudar a cor, muda só estes três números.
const zoneBlue = "74,163,255";
const zoneGlow = `drop-shadow(0 0 5px rgba(${zoneBlue},0.9))`;
const textShadow = "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)";
const MAX_ZOOM = 8;

function clampView(v: View, w: number, h: number): View {
  const z = Math.min(MAX_ZOOM, Math.max(1, v.z));
  const x = Math.min(0, Math.max(w * (1 - z), v.x));
  const y = Math.min(0, Math.max(h * (1 - z), v.y));
  return { z, x, y };
}

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
  return [z.points, ...(z.holes ?? [])].map(ring).join(" ");
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "zone";
}

function zoneCode(d: ZoneDraft) {
  const rows: string[] = [];
  for (let i = 0; i < d.points.length; i += 5) {
    rows.push("      " + d.points.slice(i, i + 5).map((p) => `[${p[0]}, ${p[1]}]`).join(", ") + ",");
  }
  return [
    "  {",
    `    id: "${slug(d.name)}",`,
    `    map: "${d.map}",`,
    `    name: "${d.name.replace(/"/g, '\\"')}",`,
    `    label: [${d.label[0]}, ${d.label[1]}],`,
    "    points: [",
    ...rows,
    "    ],",
    "  },",
  ].join("\n");
}

function LayerIcon({ layerKey, size = 22 }: { layerKey: string; size?: number }) {
  const [ok, setOk] = useState(false);
  const info = MAP_LAYERS.find((l) => l.key === layerKey);
  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setOk(true);
    probe.src = `/map/icons/${layerKey}.png`;
  }, [layerKey]);
  if (!ok) {
    return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{info?.emoji ?? "📍"}</span>;
  }
  return (
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

  const [mapId, setMapId] = useState<MapId>("island");
  const [view, setView] = useState<View>({ z: 1, x: 0, y: 0 });
  const [active, setActive] = useState<string[]>(() => MAP_LAYERS.map((l) => l.key));
  const [open, setOpen] = useState<string[]>(() => MAP_GROUPS.map((g) => g.key));
  const [selected, setSelected] = useState<Marker | null>(null);
  const [failedImg, setFailedImg] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [editLayer, setEditLayer] = useState(MAP_LAYERS[0].key);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [drawMode, setDrawMode] = useState<"points" | "zone">("points");
  const [zoneName, setZoneName] = useState("");
  const [zonePts, setZonePts] = useState<[number, number][]>([]);
  const [zoneDrafts, setZoneDrafts] = useState<ZoneDraft[]>([]);

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
    setZonePts([]);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    press.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
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

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
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
    const rx = Math.round(x * 10) / 10;
    const ry = Math.round(y * 10) / 10;
    if (drawMode === "zone") {
      setZonePts((pts) => [...pts, [rx, ry]]);
    } else {
      setDrafts((d) => [...d, { map: mapId, layer: editLayer, x: rx, y: ry }]);
    }
  }

  function finishZone() {
    if (zonePts.length < 3) return;
    const lx = zonePts.reduce((s, p) => s + p[0], 0) / zonePts.length;
    const ly = zonePts.reduce((s, p) => s + p[1], 0) / zonePts.length;
    setZoneDrafts((d) => [
      ...d,
      {
        map: mapId,
        name: zoneName.trim() || "Zone",
        points: zonePts,
        label: [Math.round(lx * 10) / 10, Math.round(ly * 10) / 10],
      },
    ]);
    setZonePts([]);
    setZoneName("");
  }

  function toggle(key: string) {
    setActive((a) => (a.includes(key) ? a.filter((k) => k !== key) : [...a, key]));
    setSelected(null);
  }

  function setLayers(keys: string[], on: boolean) {
    setActive((a) => (on ? [...a.filter((k) => !keys.includes(k)), ...keys] : a.filter((k) => !keys.includes(k))));
    setSelected(null);
  }

  function toggleOpen(key: string) {
    setOpen((o) => (o.includes(key) ? o.filter((k) => k !== key) : [...o, key]));
  }

  const mapMarkers = MARKERS.filter((m) => m.map === mapId);
  const counts: Record<string, number> = {};
  for (const m of mapMarkers) counts[m.layer] = (counts[m.layer] ?? 0) + 1;

  const zonesHere = ZONES.filter((z) => z.map === mapId);
  if (zonesHere.length > 0) counts["zones"] = zonesHere.length;
  const showZones = active.includes("zones");

  const groupsToShow = MAP_GROUPS.map((g) => ({
    ...g,
    layers: g.layers.filter((l) => edit || counts[l.key]),
  })).filter((g) => g.layers.length > 0);

  const visible = mapMarkers.filter((m) => active.includes(m.layer));
  const csv = drafts.map((d) => `  ["${d.map}", "${d.layer}", ${d.x}, ${d.y}],`).join("\n");
  const zonesCsv = zoneDrafts.map(zoneCode).join("\n");
  const allKeys = groupsToShow.flatMap((g) => g.layers.map((l) => l.key));
  const draftZonesHere = zoneDrafts.filter((z) => z.map === mapId);

  return (
    <div>
      <style>{`
        .mp-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 1rem;
          font-family: inherit;
          cursor: pointer;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .mp-btn.on {
          background: rgba(231,180,87,0.22);
          border-color: #f0c46a;
          box-shadow: 0 0 12px rgba(240,196,106,0.45);
        }
        .mp-mini { padding: 5px 12px; font-size: 0.9rem; }
        .mp-zoom { min-width: 38px; height: 38px; padding: 0 8px; justify-content: center; font-size: 1.2rem; }
        .mp-gtitle {
          background: none;
          border: none;
          color: #e7b457;
          font-size: 1.25rem;
          font-family: inherit;
          cursor: pointer;
          padding: 0;
          text-shadow: ${textShadow};
        }
        .mp-select {
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          font-size: 1rem;
          font-family: inherit;
        }
        @media (hover: hover) {
          .mp-btn:hover {
            border-color: #f0c46a;
            box-shadow: 0 0 16px rgba(240,196,106,0.6);
          }
        }
      `}</style>

      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {MAPS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => changeMap(m.key)}
              aria-pressed={mapId === m.key}
              className={`mp-btn${mapId === m.key ? " on" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {groupsToShow.length === 0 ? (
          <p style={{ color: gold, textShadow, margin: "0 0 12px", fontSize: "1.1rem" }}>
            No points on this map yet.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ color: gold, textShadow, fontSize: "1.1rem", marginRight: 4 }}>Show everything</span>
              <button type="button" className="mp-btn mp-mini" onClick={() => setLayers(allKeys, true)}>
                All
              </button>
              <button type="button" className="mp-btn mp-mini" onClick={() => setLayers(allKeys, false)}>
                None
              </button>
            </div>

            {groupsToShow.map((g) => {
              const keys = g.layers.map((l) => l.key);
              const total = keys.reduce((s, k) => s + (counts[k] ?? 0), 0);
              const isOpen = open.includes(g.key);
              return (
                <div key={g.key}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <button type="button" className="mp-gtitle" onClick={() => toggleOpen(g.key)} aria-expanded={isOpen}>
                      {g.label} ({total}) {isOpen ? "▾" : "▸"}
                    </button>
                    <button type="button" className="mp-btn mp-mini" onClick={() => setLayers(keys, true)}>
                      All
                    </button>
                    <button type="button" className="mp-btn mp-mini" onClick={() => setLayers(keys, false)}>
                      None
                    </button>
                  </div>
                  {isOpen && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {g.layers.map((l) => {
                        const on = active.includes(l.key);
                        return (
                          <button
                            key={l.key}
                            type="button"
                            onClick={() => toggle(l.key)}
                            aria-pressed={on}
                            className={`mp-btn${on ? " on" : ""}`}
                          >
                            <LayerIcon layerKey={l.key} size={18} />
                            {l.label} {counts[l.key] ? `(${counts[l.key]})` : ""}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                  <img
                    src={currentMap.image}
                    alt={currentMap.label}
                    draggable={false}
                    onError={() => setFailedImg(currentMap.image)}
                    style={{ display: "block", width: "100%", height: "auto", userSelect: "none" }}
                  />
                )}

                {showZones && zonesHere.length > 0 && (
                  <>
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        filter: zoneGlow,
                      }}
                    >
                      {zonesHere.map((z) => (
                        <path
                          key={z.id}
                          d={zonePath(z)}
                          fillRule="evenodd"
                          fill={`rgba(${zoneBlue},0.3)`}
                          stroke={`rgba(${zoneBlue},0.9)`}
                          strokeWidth={1.5}
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </svg>
                    {zonesHere.map((z) => (
                      <div
                        key={`${z.id}-label`}
                        style={{
                          position: "absolute",
                          left: `${z.label[0]}%`,
                          top: `${z.label[1]}%`,
                          transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textShadow,
                        }}
                      >
                        {z.name}
                      </div>
                    ))}
                  </>
                )}

                {edit && (draftZonesHere.length > 0 || zonePts.length > 0) && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      filter: zoneGlow,
                    }}
                  >
                    {draftZonesHere.map((z, i) => (
                      <path
                        key={i}
                        d={ring(z.points)}
                        fill={`rgba(${zoneBlue},0.3)`}
                        stroke={`rgba(${zoneBlue},0.9)`}
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    {zonePts.length > 1 && (
                      <polyline
                        points={zonePts.map((p) => `${p[0]},${p[1]}`).join(" ")}
                        fill="none"
                        stroke="#f0c46a"
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </svg>
                )}

                {edit &&
                  zonePts.map((p, i) => (
                    <span
                      key={`zp-${i}`}
                      style={{
                        position: "absolute",
                        left: `${p[0]}%`,
                        top: `${p[1]}%`,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#f0c46a",
                        border: "1px solid #fff",
                        transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}

                {visible.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelected(m)}
                    title={m.label ?? ""}
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
                    <LayerIcon layerKey={m.layer} />
                  </button>
                ))}

                {drafts
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
                        background: "#f0c46a",
                        border: "2px solid #fff",
                        transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
              </div>

              <div style={{ position: "absolute", right: 10, top: 10, display: "grid", gap: 6 }}>
                <button type="button" onClick={() => zoomCenter(1.5)} className="mp-btn mp-zoom" aria-label="Zoom in">
                  +
                </button>
                <button type="button" onClick={() => zoomCenter(1 / 1.5)} className="mp-btn mp-zoom" aria-label="Zoom out">
                  −
                </button>
                <button type="button" onClick={() => setView({ z: 1, x: 0, y: 0 })} className="mp-btn mp-zoom" aria-label="Reset view">
                  ⟲
                </button>
              </div>
            </div>
          </div>
        </TextBox>

        {edit && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setDrawMode("points")}
                className={`mp-btn${drawMode === "points" ? " on" : ""}`}
              >
                Points
              </button>
              <button
                type="button"
                onClick={() => setDrawMode("zone")}
                className={`mp-btn${drawMode === "zone" ? " on" : ""}`}
              >
                Zone
              </button>
            </div>

            {drawMode === "points" ? (
              <div>
                <div style={{ color: gold, textShadow, fontSize: "1.1rem", marginBottom: 8 }}>
                  Pick a layer, then click the map to add points
                </div>
                <select value={editLayer} onChange={(e) => setEditLayer(e.target.value)} className="mp-select" style={{ marginBottom: 10 }}>
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
                <button type="button" onClick={() => setDrafts([])} className="mp-btn mp-mini">
                  Clear points
                </button>
              </div>
            ) : (
              <div>
                <div style={{ color: gold, textShadow, fontSize: "1.1rem", marginBottom: 8 }}>
                  Type the zone name, click around the zone on the map, then press Finish zone
                </div>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Zone name"
                  className="mp-select"
                  style={{ marginBottom: 10, minWidth: 240 }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <button
                    type="button"
                    onClick={() => setZonePts((pts) => pts.slice(0, -1))}
                    className="mp-btn mp-mini"
                  >
                    Undo last point
                  </button>
                  <button type="button" onClick={() => setZonePts([])} className="mp-btn mp-mini">
                    Clear this zone
                  </button>
                  <button type="button" onClick={finishZone} className="mp-btn mp-mini on">
                    Finish zone ({zonePts.length} points)
                  </button>
                </div>
                <textarea
                  readOnly
                  value={zonesCsv}
                  rows={10}
                  placeholder="The code for your zones shows up here"
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
                  Copy this into mapZones.ts, inside the [ ].
                </div>
                <button type="button" onClick={() => setZoneDrafts([])} className="mp-btn mp-mini">
                  Clear all zones
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <TextBox raw wide>
            <div className="tb-label">{selected.label || MAP_LAYERS.find((l) => l.key === selected.layer)?.label}</div>
            {selected.note && <div className="tb-value">{selected.note}</div>}
          </TextBox>
        </div>
      )}
    </div>
  );
}