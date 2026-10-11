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

function maxPrice(item: ListItem) {
  const prices = [item.price_1, item.price_2, item.price_3, item.price_4, item.price_5]
    .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
    .map(Number);
  return prices.length ? Math.max(...prices) : 0;
}

function unique(items: ListItem[], key: keyof ListItem) {
  const set = new Set<string>();
  for (const item of items) {
    const v = item[key];
    if (v != null && String(v).trim() !== "") set.add(String(v).trim());
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

  const zones = useMemo(() => unique(items, "location_zone"), [items]);
  const weathers = useMemo(() => unique(items, "weather"), [items]);
  const events = useMemo(() => unique(items, "event_tag"), [items]);
  const shadows = useMemo(() => unique(items, "shadow"), [items]);

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
    <main style={{ padding: "96px 24px 24px" }}>
      <button
        type="button"
        onClick={() => router.push(parentHref)}
        style={{
          background: "transparent",
          border: "none",
          color: "#7dd3fc",
          cursor: "pointer",
          padding: 0,
          marginBottom: 12,
          fontSize: "0.95rem",
        }}
      >
        ← {parentLabel}
      </button>

      <h1 style={{ fontSize: "1.75rem", marginBottom: 8 }}>{title}</h1>
      <p style={{ color: "#e7b457", opacity: 0.8, marginBottom: 16 }}>
        {filtered.length} / {items.length} items
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          style={{
            flex: "1 1 200px",
            maxWidth: 320,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(231,180,87,0.35)",
            background: "#021432",
            color: "#e7b457",
          }}
        />

        {typeOptions && typeOptions.length > 0 && (
          <select
            value={typeTab}
            onChange={(e) => setTypeTab(e.target.value)}
            style={selectStyle}
          >
            <option value="all">TYPE: ALL</option>
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={selectStyle}>
          <option value="game">SORT: GAME ORDER</option>
          <option value="level">SORT: LEVEL</option>
          <option value="name">SORT: NAME</option>
          <option value="price">SORT: PRICE</option>
        </select>

        {zones.length > 0 && (
          <select
            value={locationZone}
            onChange={(e) => setLocationZone(e.target.value)}
            style={selectStyle}
          >
            <option value="all">LOCATION: ALL</option>
            {zones.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}

        {weathers.length > 0 && (
          <select value={weather} onChange={(e) => setWeather(e.target.value)} style={selectStyle}>
            <option value="all">WEATHER: ALL</option>
            {weathers.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}

        {events.length > 0 && (
          <select value={event} onChange={(e) => setEvent(e.target.value)} style={selectStyle}>
            <option value="all">EVENT: ALL</option>
            {events.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}

        {showShadow && shadows.length > 0 && (
          <select value={shadow} onChange={(e) => setShadow(e.target.value)} style={selectStyle}>
            <option value="all">SHADOW: ALL</option>
            {shadows.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
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
              {item.name}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}