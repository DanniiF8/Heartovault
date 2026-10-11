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

const LOCATION_BLOCKLIST = new Set(
  [
    "river",
    "lake",
    "sea",
    "waterside",
    "ocean",
    "event",
    "all",
    "null",
    "undefined",
  ].map((s) => s.toLowerCase())
);

function maxPrice(item: ListItem) {
  const prices = [item.price_1, item.price_2, item.price_3, item.price_4, item.price_5]
    .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
    .map(Number);
  return prices.length ? Math.max(...prices) : 0;
}

function uniqueClean(items: ListItem[], key: keyof ListItem, blocklist?: Set<string>) {
  const set = new Set<string>();
  for (const item of items) {
    const raw = item[key];
    if (raw == null) continue;
    const v = String(raw).trim();
    if (!v) continue;
    const lower = v.toLowerCase();
    if (lower === "all" || lower === "null" || lower === "undefined") continue;
    if (blocklist && blocklist.has(lower)) continue;
    set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("game");
  const [typeTab, setTypeTab] = useState("all");
  const [locationZone, setLocationZone] = useState("all");
  const [weather, setWeather] = useState("all");
  const [event, setEvent] = useState("all");
  const [shadow, setShadow] = useState("all");

  const hasLevels = useMemo(
    () => items.some((i) => i.unlock_level != null && Number(i.unlock_level) > 0),
    [items]
  );

  const zones = useMemo(
    () => uniqueClean(items, "location_zone", LOCATION_BLOCKLIST),
    [items]
  );
  const weathers = useMemo(() => uniqueClean(items, "weather"), [items]);
  const events = useMemo(() => uniqueClean(items, "event_tag"), [items]);
  const shadows = useMemo(() => uniqueClean(items, "shadow"), [items]);

  const showLocation = zones.length > 1;
  const showWeather = weathers.length > 1;
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
      if (locationZone !== "all" && String(item.location_zone ?? "") !== locationZone) {
        return false;
      }
      if (weather !== "all") {
        const w = String(item.weather ?? "").toLowerCase();
        if (!w.includes(weather.toLowerCase())) return false;
      }
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
  }, [items, q, sort, typeTab, typeField, locationZone, weather, event, shadow]);

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
                label={opt.replace(/_/g, " ")}
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

        {showLocation && (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Location</span>
            <select
              value={locationZone}
              onChange={(e) => setLocationZone(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All</option>
              {zones.map((v) => (
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
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
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
            <div style={{ marginTop: 8, fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</div>
          </a>
        ))}
      </div>
    </main>
  );
}