"use client";

import { useMemo, useState } from "react";

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

function Chip({
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
        border: "1px solid rgba(231,180,87,0.35)",
        background: active ? "#e7b457" : "transparent",
        color: active ? "#021432" : "#e7b457",
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: "0.85rem",
        cursor: "pointer",
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
}: {
  items: ListItem[];
  title: string;
  basePath: string;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("game");
  const [zone, setZone] = useState("all");
  const [loc, setLoc] = useState("all");
  const [sub, setSub] = useState("all");
  const [weather, setWeather] = useState("all");
  const [event, setEvent] = useState("all");

  const zones = useMemo(() => unique(items, "location_zone"), [items]);
  const subs = useMemo(() => unique(items, "subcategory"), [items]);
  const weathers = useMemo(() => unique(items, "weather"), [items]);
  const events = useMemo(() => unique(items, "event_tag"), [items]);

  const locations = useMemo(() => {
    const list =
      zone === "all"
        ? items
        : items.filter((i) => String(i.location_zone ?? "") === zone);
    return unique(list, "location");
  }, [items, zone]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query)) return false;
      if (zone !== "all" && String(item.location_zone ?? "") !== zone) return false;
      if (loc !== "all" && String(item.location ?? "") !== loc) return false;
      if (sub !== "all" && String(item.subcategory ?? "") !== sub) return false;
      if (weather !== "all") {
        const w = String(item.weather ?? "").toLowerCase();
        if (!w.includes(weather.toLowerCase())) return false;
      }
      if (event !== "all" && String(item.event_tag ?? "") !== event) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "level") return (a.unlock_level ?? 0) - (b.unlock_level ?? 0);
      if (sort === "price") return maxPrice(b) - maxPrice(a);
      return (a.game_order ?? 99999) - (b.game_order ?? 99999);
    });

    return list;
  }, [items, q, sort, zone, loc, sub, weather, event]);

  return (
    <main style={{ padding: "72px 24px 24px" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: 8 }}>{title}</h1>
      <p style={{ color: "#e7b457", opacity: 0.8, marginBottom: 16 }}>
        {filtered.length} / {items.length} items
      </p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${title.toLowerCase()} by name...`}
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(231,180,87,0.35)",
          background: "#021432",
          color: "#e7b457",
          marginBottom: 16,
        }}
      />

      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ opacity: 0.7, alignSelf: "center" }}>Sort:</span>
        <Chip active={sort === "game"} label="Game order" onClick={() => setSort("game")} />
        <Chip active={sort === "level"} label="Level" onClick={() => setSort("level")} />
        <Chip active={sort === "name"} label="Name" onClick={() => setSort("name")} />
        <Chip active={sort === "price"} label="Price" onClick={() => setSort("price")} />
      </div>

      {subs.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip active={sub === "all"} label="All types" onClick={() => setSub("all")} />
          {subs.map((v) => (
            <Chip key={v} active={sub === v} label={v} onClick={() => setSub(v)} />
          ))}
        </div>
      )}

      {zones.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ opacity: 0.7, alignSelf: "center" }}>Zone:</span>
          <Chip
            active={zone === "all"}
            label="All"
            onClick={() => {
              setZone("all");
              setLoc("all");
            }}
          />
          {zones.map((v) => (
            <Chip
              key={v}
              active={zone === v}
              label={v}
              onClick={() => {
                setZone(v);
                setLoc("all");
              }}
            />
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ opacity: 0.7, alignSelf: "center" }}>Location:</span>
          <Chip active={loc === "all"} label="All" onClick={() => setLoc("all")} />
          {locations.map((v) => (
            <Chip key={v} active={loc === v} label={v} onClick={() => setLoc(v)} />
          ))}
        </div>
      )}

      {weathers.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ opacity: 0.7, alignSelf: "center" }}>Weather:</span>
          <Chip active={weather === "all"} label="All" onClick={() => setWeather("all")} />
          {["sunny", "rain", "rainbow"].map((v) => (
            <Chip
              key={v}
              active={weather === v}
              label={v}
              onClick={() => setWeather(v)}
            />
          ))}
        </div>
      )}

      {events.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ opacity: 0.7, alignSelf: "center" }}>Season / tag:</span>
          <Chip active={event === "all"} label="All" onClick={() => setEvent("all")} />
          {events.map((v) => (
            <Chip key={v} active={event === v} label={v} onClick={() => setEvent(v)} />
          ))}
        </div>
      )}

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
            {item.location && (
              <div style={{ marginTop: 4, fontSize: "0.75rem", opacity: 0.7 }}>
                {item.location}
              </div>
            )}
          </a>
        ))}
      </div>
    </main>
  );
}