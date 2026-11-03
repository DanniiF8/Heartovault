"use client";

import { useMemo } from "react";
import { ZONES } from "./mapZones";

export type PanelItem = {
  id: number;
  name: string;
  category: string;
  image_url: string | null;
  location: string | null;
  location_zone: string | null;
};

const gold = "#e7b457";
const goldLight = "#f0c46a";

const CATS = [
  { key: "birds", label: "Birds", path: "birdwatching" },
  { key: "fish", label: "Fish", path: "fishing" },
  { key: "insects", label: "Insects", path: "insect_catching" },
];

const LAKES = ["suburban-lake", "forest-lake", "meadow-lake", "onsen-mountain-lake"];
const RIVERS = ["tranquil-river", "shallow-river", "giantwood-river", "rosy-river"];
const SEAS = ["old-sea", "east-sea", "zephyr-sea", "whale-sea"];

const GROUPS: Record<string, string[]> = {
  forest: ["Forest Jump Puzzle", "Deer Tower", "Spirit-Oak Pine Forest", "Forest Island"],
  "onsen mountain": ["Stone Cliff", "Onsen", "Crater Lake", "Ruins"],
  "flower field": ["Whale Mountain", "Windmill Flower Field", "Amethyst Beach"],
  "fishing village": ["Lighthouse", "Wharf", "Fishing Village Square", "East Pier of Fishing Village"],
  suburbs: ["Suburbs", "Art Street", "Residential Street", "Garden Street", "Central Square"],
};

// minúsculas, sem hífen e sem espaços a mais (assim "Spirit Oak" = "Spirit-Oak")
const norm = (s: string) => s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();

const idsByName = new Map<string, string[]>();
for (const z of ZONES) {
  const k = norm(z.name);
  idsByName.set(k, [...(idsByName.get(k) ?? []), z.id]);
}

const byName = (names: string[]): string[] => names.flatMap((n) => idsByName.get(norm(n)) ?? []);

function resolveKey(k: string): string[] {
  if (k === "lake" || k === "all lakes") return LAKES;
  if (k === "river" || k === "river bank" || k === "all rivers") return RIVERS;
  if (k === "ocean" || k === "seaside" || k === "all seas") return SEAS;
  if (k === "waterside") return [...LAKES, ...RIVERS];
  if (k === "central area") return byName(["Central Square"]);
  if (k === "jump puzzle") return byName(["Forest Jump Puzzle"]);
  if (k === "home") return byName(["Residential Area"]);
  if (k.includes("headtop")) return byName(["Garden Street"]);
  if (k === "suburbs lakeshore") return ["suburban-lake"];
  const g = GROUPS[k];
  if (g) return byName(g);
  return idsByName.get(k) ?? [];
}

// "Forest Lake Shore" -> "forest lake"; "East Sea Seaside" -> "east sea"
function stripShore(k: string): string {
  return k.replace(/ lake ?shore$/, " lake").replace(/ seaside$/, "");
}

// Em que zonas aparece o item (location primeiro; se não der, location_zone)
export function zonesFor(item: PanelItem): string[] {
  const loc = norm(item.location ?? "");
  if (loc.includes("event")) return []; // eventos têm o painel próprio (eventItemsFor)
  const ids: string[] = [];
  if (loc) {
    for (const part of loc.split(" and ")) {
      const k = part.trim();
      let r = resolveKey(k);
      if (r.length === 0) r = resolveKey(stripShore(k));
      ids.push(...r);
    }
  }
  if (ids.length === 0 && item.location_zone) {
    ids.push(...resolveKey(norm(item.location_zone)));
  }
  return Array.from(new Set(ids));
}

// Itens de cada evento do mapa (camada do ponto -> itens)
export function eventItemsFor(layer: string, items: PanelItem[]): PanelItem[] {
  return items.filter((it) => {
    const loc = norm(it.location ?? "");
    const zone = norm(it.location_zone ?? "");
    if (layer === "event_butterfly") return loc.startsWith("bait the insects event");
    if (layer === "event_bird") return loc.startsWith("nest of hundreds event");
    if (layer === "event_fish") return zone === "sea fishing event";
    return false;
  });
}

export default function ZonePanel({
  zoneId,
  items,
  eventLayer = null,
  eventTitle = "",
}: {
  zoneId: string | null;
  items: PanelItem[];
  eventLayer?: string | null;
  eventTitle?: string;
}) {
  const byZone = useMemo(() => {
    const m = new Map<string, PanelItem[]>();
    for (const it of items) {
      for (const zid of zonesFor(it)) {
        const arr = m.get(zid);
        if (arr) arr.push(it);
        else m.set(zid, [it]);
      }
    }
    return m;
  }, [items]);

  const zone = zoneId ? ZONES.find((z) => z.id === zoneId) : undefined;

  const boxStyle = {
    padding: 16,
    borderRadius: 16,
    border: "1px solid rgba(231,180,87,0.35)",
    background: "linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5))",
    color: gold,
    boxSizing: "border-box" as const,
  };

  if (!eventLayer && !zone) {
    return <div style={boxStyle}>Click a zone on the map to see its birds, insects and fish.</div>;
  }

  const title = eventLayer ? eventTitle : zone ? zone.name : "";
  const list: PanelItem[] = eventLayer
    ? eventItemsFor(eventLayer, items)
    : zone
      ? byZone.get(zone.id) ?? []
      : [];

  return (
    <div style={boxStyle}>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: goldLight }}>{title}</div>
      <div style={{ marginBottom: 4 }}>
        {list.length} {list.length === 1 ? "item" : "items"}
      </div>

      {list.length === 0 && (
        <div style={{ marginTop: 8 }}>
          {eventLayer ? "Nothing listed for this event yet." : "Nothing listed for this zone yet."}
        </div>
      )}

      {CATS.map((c) => {
        const rows = list.filter((it) => it.category === c.key);
        if (rows.length === 0) return null;
        return (
          <div key={c.key}>
            <div style={{ color: goldLight, fontSize: "1.15rem", margin: "12px 0 6px" }}>
              {c.label} ({rows.length})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
              {rows.map((it) => (
                <a
                  key={it.id}
                  href={`/collections/${c.path}/${it.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 8px",
                    borderRadius: 10,
                    border: "1px solid rgba(231,180,87,0.25)",
                    background: "rgba(0,16,40,0.5)",
                    color: gold,
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      flex: "0 0 44px",
                      borderRadius: 8,
                      border: "1px dashed rgba(231,180,87,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {it.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image_url}
                        alt=""
                        loading="lazy"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    )}
                  </span>
                  <span style={{ fontSize: "1rem", lineHeight: 1.15 }}>{it.name}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}