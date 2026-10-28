"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { itemKey, useProgress } from "../lib/progress";
import ItemCard, { ItemCardStyles } from "./ItemCard";
import PageBackground from "./PageBackground";
import { useStars } from "../lib/stars";
import { supabase } from "../lib/supabase";
import { EB_Garamond } from "next/font/google";

const body = EB_Garamond({ subsets: ["latin"] });

// FUNDOS: último pedaço do basePath -> imagem (e blur). Para mudar um fundo, mexe só aqui.
const BACKGROUNDS: Record<string, { image: string; blur?: number }> = {
  insect_catching: { image: "insects.webp" },
  gardening: { image: "gardening.webp" },
  fishing: { image: "fishing.webp" },
  birdwatching: { image: "birdwatching.webp" },
  cooking: { image: "cooking.webp" },
  ocean_cleanup: { image: "ocean_cleanup.webp" },
  clothes: { image: "clothes.webp" },
  furniture: { image: "furniture.webp" },
  other: { image: "other_collections.webp" },
  snow_sculpting: { image: "snow_sculpting.webp" },
  sand_sculpting: { image: "sand_sculpting.webp" },
  pumpkin_carving: { image: "pumpkin_carving.webp" },
};

function backgroundFor(basePath: string) {
  const seg = basePath.split("/").filter(Boolean).pop() ?? "";
  return BACKGROUNDS[seg] ?? null;
}

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
  set?: string | null;
  item_key?: string | null;
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

function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`hv-pill${active ? " on" : ""}`}>
      {label}
    </button>
  );
}

// etiqueta + menu sempre juntos
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="hv-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function FilterStyles() {
  return (
    <style>{`
      .hv-search {
        flex: 1 1 200px;
        max-width: 320px;
        padding: 11px 16px;
        border-radius: 999px;
        border: 1px solid rgba(231,180,87,0.35);
        background: rgba(0,16,40,0.88);
        color: #e7b457;
        font-size: 1rem;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .hv-search::placeholder { color: #e7b457; opacity: 1; }
      .hv-pill {
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
      .hv-pill.on {
        background: rgba(231,180,87,0.22);
        border-color: #f0c46a;
        box-shadow: 0 0 12px rgba(240,196,106,0.45);
      }
      .hv-sel {
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
      .hv-sel option { background: #021432; color: #e7b457; }
      .hv-search:hover, .hv-pill:hover, .hv-sel:hover {
        border-color: #f0c46a;
        box-shadow: 0 0 16px rgba(240,196,106,0.6);
      }
      .hv-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        color: #e7b457;
        font-size: 1rem;
      }
      .hv-box {
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
  const progress = useProgress();
  const stars = useStars();
  const bg = backgroundFor(basePath);

  // objetos com badges de mastery (vai buscar uma vez, serve para todas as categorias)
  const [masteryIds, setMasteryIds] = useState<Set<number>>(new Set());
  const [masteryLoaded, setMasteryLoaded] = useState(false);
  useEffect(() => {
    let on = true;
    supabase
      .from("items")
      .select("id, mastery_apprentice_req")
      .not("mastery_apprentice_req", "is", null)
      .then(({ data }) => {
        if (!on || !data) return;
        setMasteryLoaded(true);
        const rows = data as unknown as { id: number; mastery_apprentice_req: unknown }[];
        const empty = ["", "all", "-", "—", "none", "n/a", "null", "undefined"];
        setMasteryIds(
          new Set(
            rows
              .filter((r) => !empty.includes(String(r.mastery_apprentice_req).trim().toLowerCase()))
              .map((r) => r.id)
          )
        );
      });
    return () => {
      on = false;
    };
  }, []);
  const hasMasteryOf = (i: ListItem) => !masteryLoaded || masteryIds.has(i.id);

  // marca estrelas/mastery e mantém o "obtido" certo
  function change(key: string, next: { s: number; m: number }) {
    stars.set(key, next);
    const obtained = next.s > 0 || next.m > 0;
    if (obtained !== progress.has(key)) progress.toggle(key);
  }

  const [show, setShow] = useState<"all" | "obtained" | "missing">("all");
  const [open, setOpen] = useState(false);
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
  const allLocations = useMemo(() => uniqueClean(items, "location"), [items]);
  const locations = useMemo(
    () =>
      uniqueClean(
        zone === "all" ? items : items.filter((i) => norm(i.location_zone) === norm(zone)),
        "location"
      ),
    [items, zone]
  );
  const weathers = useMemo(() => uniqueTokens(items, "weather"), [items]);
  const schedules = useMemo(() => uniqueTokens(items, "schedule", SCHEDULE_ORDER), [items]);
  const events = useMemo(() => uniqueClean(items, "event_tag"), [items]);
  const shadows = useMemo(() => uniqueClean(items, "shadow"), [items]);

  const showZone = zones.length > 1;
  const showLocation = allLocations.length > 1;
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
      if (show !== "all") {
        const owned = progress.has(itemKey(item));
        if (show === "obtained" && !owned) return false;
        if (show === "missing" && owned) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "level") return (a.unlock_level ?? 0) - (b.unlock_level ?? 0);
      if (sort === "price") return maxPrice(b) - maxPrice(a);
      return (a.game_order ?? 99999) - (b.game_order ?? 99999);
    });

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, q, sort, typeTab, typeField, zone, location, weather, schedule, event, shadow, show, progress.version]);

  const obtainedCount = items.filter((i) => progress.has(itemKey(i))).length;
  const pts = items.map((i) => {
    const key = itemKey(i);
    const rating = Math.min(5, Number(i.max_stars) || 0);
    const m = hasMasteryOf(i) ? 3 : 0;
    if (rating + m === 0) return { total: 1, got: progress.has(key) ? 1 : 0 };
    const e = stars.get(key);
    return { total: rating + m, got: Math.min(e.s, rating) + Math.min(e.m, m) };
  });
  const totalPoints = pts.reduce((n, p) => n + p.total, 0);
  const gotPoints = pts.reduce((n, p) => n + p.got, 0);
  const percent = totalPoints ? Math.round((gotPoints / totalPoints) * 100) : 0;

  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      {bg && <PageBackground image={bg.image} blur={bg.blur ?? 0} />}
      <main className={body.className} style={{ padding: "100px 16px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <FilterStyles />

        <button
          type="button"
          onClick={() => router.push(parentHref)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--hv-link)",
            cursor: "pointer",
            padding: 0,
            marginBottom: 10,
            fontSize: "1.15rem",
          }}
        >
          ← {parentLabel}
        </button>

        <p style={{ color: "#e7b457", fontSize: "1.2rem", marginBottom: 10 }}>
          {obtainedCount} / {items.length} items
        </p>
        <div style={{ maxWidth: 420, marginBottom: 18 }}>
          <div style={{ color: "#e7b457", fontSize: "1.1rem", marginBottom: 6 }}>
            Progress {percent}%
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, height: "100%", background: "#e7b457", transition: "width 0.3s" }} />
          </div>
          <div style={{ color: "#e7b457", fontSize: "0.9rem", marginTop: 6 }}>
            Your progress is saved in this browser.
          </div>
        </div>

        {/* UMA SÓ LINHA: Search / All / Obtained / Missing / Filters */}
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
            type="search"
            className="hv-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
          <Pill active={show === "all"} label="All" onClick={() => setShow("all")} />
          <Pill active={show === "obtained"} label="Obtained" onClick={() => setShow("obtained")} />
          <Pill active={show === "missing"} label="Missing" onClick={() => setShow("missing")} />
          <Pill active={open} label="Filters" onClick={() => setOpen((v) => !v)} />
        </div>

        {open && (
          <div className="hv-box">
            <Field label="Sort by">
              <select className="hv-sel" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="game">Game order</option>
                {hasLevels && <option value="level">Level</option>}
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </Field>

            {showZone && (
              <Field label="Zone">
                <select
                  className="hv-sel"
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value);
                    setLocation("all");
                  }}
                >
                  <option value="all">All</option>
                  {zones.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {showLocation && (
              <Field label="Location">
                <select className="hv-sel" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="all">All</option>
                  {locations.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {showWeather && (
              <Field label="Weather">
                <select className="hv-sel" value={weather} onChange={(e) => setWeather(e.target.value)}>
                  <option value="all">All</option>
                  {weathers.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {showSchedule && (
              <Field label="Schedule">
                <select className="hv-sel" value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                  <option value="all">All</option>
                  {schedules.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {showEvent && (
              <Field label="Event">
                <select className="hv-sel" value={event} onChange={(e) => setEvent(e.target.value)}>
                  <option value="all">All</option>
                  {events.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {showShadowFilter && (
              <Field label="Shadow">
                <select className="hv-sel" value={shadow} onChange={(e) => setShadow(e.target.value)}>
                  <option value="all">All</option>
                  {shadows.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {typeOptions && typeOptions.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <Pill active={typeTab === "all"} label="All" onClick={() => setTypeTab("all")} />
                {typeOptions.map((opt) => (
                  <Pill
                    key={opt}
                    active={typeTab === opt}
                    label={opt === "cds" ? "CDs" : opt.replace(/_/g, " ")}
                    onClick={() => setTypeTab(opt)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className="it-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${wideCards ? 220 : 185}px, 1fr))`,
            gap: wideCards ? 24 : 20,
          }}
        >
          <ItemCardStyles />
          {filtered.map((item) => {
            const key = itemKey(item);
            const e = stars.get(key);
            return (
              <ItemCard
                key={item.id}
                item={item}
                href={`${basePath}/${item.id}`}
                owned={progress.has(key)}
                stars={e.s}
                mastery={e.m}
                onStars={(n) => change(key, { s: n, m: e.m })}
                onMastery={(n) => change(key, { s: e.s, m: n })}
                onOwned={() => progress.toggle(key)}
                wide={wideCards}
                hasMastery={hasMasteryOf(item)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}