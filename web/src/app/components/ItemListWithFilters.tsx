"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type ListItem = {
  id: number;
  name: string;
  subcategory?: string | null;
  unlock_level?: number | null;
  max_stars?: number | null;
  image_url?: string | null;
  location?: string | null;
  location_zone?: string | null;
  weather?: string | null;
  schedule?: string | null;
  event_tag?: string | null;
  shadow?: string | null;
  game_order?: number | null;
  price_1?: number | null;
  price_2?: number | null;
  price_3?: number | null;
  price_4?: number | null;
  price_5?: number | null;
  filter?: string | null;
  currency?: string | null;
  buy_price?: number | null;
  source?: string | null;
};

type SortKey = "game" | "level" | "name" | "price";

const SCHEDULE_ORDER = ["dawn", "day", "dusk", "night"];

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function splitTokens(v: unknown): string[] {
  return String(v ?? "")
    .split(/[·,/|]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// "Night · Dusk" -> ["Night", "Dusk"]; ignora "All"
function uniqueTokens(items: ListItem[], key: keyof ListItem, order?: string[]) {
  const map = new Map<string, string>();
  for (const item of items) {
    for (const t of splitTokens(item[key])) {
      const lower = t.toLowerCase();
      if (lower === "all" || lower === "null" || lower === "undefined") continue;
      if (!map.has(lower)) map.set(lower, t);
    }
  }
  const list = Array.from(map.entries());
  list.sort((a, b) => {
    if (order) {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }
    return a[1].localeCompare(b[1]);
  });
  return list.map(([, v]) => v);
}

// "All" aparece em qualquer filtro; vazio nunca aparece
function matchesTokens(value: unknown, wanted: string) {
  const tokens = splitTokens(value).map((t) => t.toLowerCase());
  if (tokens.length === 0) return false;
  return tokens.includes("all") || tokens.includes(wanted.toLowerCase());
}

// "Starspell Voyager ( Platform) Lost City" -> 3 linhas
function nameLines(name: string): string[] {
  const m = name.match(/^(.*?)\s*\(\s*(.*?)\s*\)\s*(.*)$/);
  if (!m) return [name];
  return [m[1].trim(), `(${m[2].trim()})`, m[3].trim()].filter(Boolean);
}

function maxPrice(item: ListItem) {
  const prices = [item.price_1, item.price_2, item.price_3, item.price_4, item.price_5]
    .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
    .map(Number);
  return prices.length ? Math.max(...prices) : 0;
}

function uniqueClean(items: ListItem[], key: keyof ListItem) {
  const map = new Map<string, string>();
  for (const item of items) {
    const raw = item[key];
    if (raw == null) continue;
    const v = String(raw).trim();
    if (!v) continue;
    const lower = v.toLowerCase();
    if (lower === "all" || lower === "null" || lower === "undefined") continue;
    if (!map.has(lower)) map.set(lower, v);
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(231,180,87,0.35)",
  background: "#021432",
  color: "#e7b457",
  fontSize: "0.85rem",
  cursor: "pointer",
};

function TypeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid rgba(231,180,87,0.4)",
        background: active ? "#e7b457" : "transparent",
        color: active ? "#021432" : "#e7b457",
        borderRadius: 999,
        padding: "7px 14px",
        fontSize: "0.85rem",
        cursor: "pointer",
        textTransform: "capitalize",
      }}
    >
      {label}
    </button>
  );
}

export default function ItemListWithFilters({
  items,
  title,
  basePath,
  typeOptions,
  typeField = "subcategory",
  showShadow = false,
  parentHref = "/collections",
  parentLabel = "Collections",
}: {
  items: ListItem[];
  title: string;
  basePath: string;
  typeOptions?: string[];
  typeField?: "subcategory" | "filter";
  showShadow?: boolean;
  parentHref?: string;
  parentLabel?: string;
}) {
  const router = useRouter();
  const wideCards = /\/(clothes|furniture)$/.test(basePath);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("game");
  const [typeTab, setTypeTab] = useState("all");
  const [zone, setZone] = useState("all");
  const [location, setLocation] = useState("all");
  const [schedule, setSchedule] = useState("all");
  const [weather, setWeather] = useState("all");
  const [event, setEvent] = useState("all");
  const [shadow, setShadow] = useState("all");

  const hasLevels = useMemo(
    () => items.some((i) => i.unlock_level != null && Number(i.unlock_level) > 0),
    [items]
  );

  const zones = useMemo(() => uniqueClean(items, "location_zone"), [items]);
  const locations = useMemo(() => uniqueClean(items, "location"), [items]);
  const weathers = useMemo(() => uniqueTokens(items, "weather"), [items]);
  const schedules = useMemo(() => uniqueTokens(items, "schedule", SCHEDULE_ORDER), [items]);
  const events = useMemo(() => uniqueClean(items, "event_tag"), [items]);
  const shadows = useMemo(() => uniqueClean(items, "shadow"), [items]);

  const showZone = zones.length > 1;
  const showLocation = locations.length > 1;
  const showWeather = weathers.length > 0;
  const showSchedule = schedules.length > 0;
  const showEvent = events.length > 0;
  const showShadowFilter = showShadow && shadows.length > 1;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query)) return false;
      if (typeTab !== "all") {
        const v = String(item[typeField] ?? "").toLowerCase();
        if (v !== typeTab.toLowerCase()) return false;
      }
      if (zone !== "all" && norm(item.location_zone) !== norm(zone)) return false;
      if (location !== "all" && norm(item.location) !== norm(location)) return false;
      if (weather !== "all" && !matchesTokens(item.weather, weather)) return false;
      if (schedule !== "all" && !matchesTokens(item.schedule, schedule)) return false;
      if (event !== "all" && String(item.event_tag ?? "") !== event) return false;
      if (shadow !== "all" && String(item.shadow ?? "") !== shadow) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "level") return (a.unlock_level ?? 0) - (b.unlock_level ?? 0);
      if (sort === "price") return maxPrice(b) - maxPrice(a);
      return (a.game_order ?? 99999) - (b.game_order ?? 99999);
    });

    return list;
  }, [items, q, sort, typeTab, typeField, zone, location, weather, schedule, event, shadow]);

  return (
    <main style={{ padding: "100px 16px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <button
        type="button"
        onClick={() => router.push(parentHref)}
        style={{
          background: "transparent",
          border: "none",
          color: "#7dd3fc",
          cursor: "pointer",
          padding: 0,
          marginBottom: 8,
          fontSize: "0.95rem",
        }}
      >
        ← {parentLabel}
      </button>

      <h1 style={{ fontSize: "1.75rem", margin: "0 0 8px", color: "#e7b457" }}>{title}</h1>
      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        {filtered.length} / {items.length} items
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          style={{
            flex: "1 1 180px",
            maxWidth: 280,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(231,180,87,0.35)",
            background: "#021432",
            color: "#e7b457",
          }}
        />

        {typeOptions && typeOptions.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TypeButton active={typeTab === "all"} label="All" onClick={() => setTypeTab("all")} />
            {typeOptions.map((opt) => (
              <TypeButton
                key={opt}
                active={typeTab === opt}
                label={opt === "cds" ? "CDs" : opt.replace(/_/g, " ")}
                onClick={() => setTypeTab(opt)}
              />
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Sort by</span>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={selectStyle}>
          <option value="game">Game order</option>
          {hasLevels && <option value="level">Level</option>}
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>

        {showZone && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Zone</span>
            <select value={zone} onChange={(e) => setZone(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {zones.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </>
        )}

        {showLocation && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Location</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {locations.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </>
        )}

        {showWeather && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Weather</span>
            <select value={weather} onChange={(e) => setWeather(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {weathers.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </>
        )}

        {showSchedule && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Schedule</span>
            <select value={schedule} onChange={(e) => setSchedule(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {schedules.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </>
        )}

        {showEvent && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Event</span>
            <select value={event} onChange={(e) => setEvent(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {events.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </>
        )}

        {showShadowFilter && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Shadow</span>
            <select value={shadow} onChange={(e) => setShadow(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {shadows.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${wideCards ? 180 : 130}px, 1fr))`,
          gap: 12,
        }}
      >
        {filtered.map((item) => (
          <a
            key={item.id}
            href={`${basePath}/${item.id}`}
            style={{
              background: "#0a2a5c",
              borderRadius: 12,
              padding: 12,
              textAlign: "center",
              textDecoration: "none",
              color: "#e7b457",
            }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                width={80}
                height={80}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div style={{ height: 80, opacity: 0.35 }}>No image</div>
            )}
            <div style={{ marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>
              {(wideCards ? nameLines(item.name) : [item.name]).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}