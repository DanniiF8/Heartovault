"use client";

import { useEffect, useMemo, useState } from "react";
import { Birthstone } from "next/font/google";
import TextBox from "../components/TextBox";

const heading = Birthstone({ subsets: ["latin"], weight: "400" });

type Crop = {
  id: number;
  name: string;
  growth_time: string;
  image_url: string | null;
};

type Starter = {
  id: string;
  name: string;
  label: string;
  minMinutes: number;
  maxMinutes: number;
  image_url?: string | null;
};

type Timer = {
  key: string;
  name: string;
  startedAt: number;
  endsAt: number;
  maxEndsAt?: number;
};

const STORAGE_KEY = "hv_timers_v1";

// Respawns rápidos ao longo do dia (tempos aproximados, a confirmar no jogo)
const RESPAWNS: Starter[] = [
  { id: "mushrooms", name: "Common Mushrooms (Shiitake, Oyster, Champignon)", label: "2–3 min", minMinutes: 2, maxMinutes: 3 },
  { id: "black-truffle", name: "Black Truffles", label: "13–15 min", minMinutes: 13, maxMinutes: 15 },
  { id: "rare-timber", name: "Rare Timber", label: "2 h", minMinutes: 120, maxMinutes: 120 },
  { id: "fruit-trees", name: "Fruit Trees (Apples & Tangerines)", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "berry-bushes", name: "Berry Bushes (Blueberries & Raspberries) and Branches", label: "2–5 min", minMinutes: 2, maxMinutes: 5 },
  { id: "stone-ore", name: "Stone & Ore (common)", label: "5–10 min", minMinutes: 5, maxMinutes: 10 },
  { id: "bamboo", name: "Bamboo", label: "10–15 min", minMinutes: 10, maxMinutes: 15 },
  { id: "timber", name: "Timber & Quality Timber", label: "5–10 min", minMinutes: 5, maxMinutes: 10 },
];

function toMinutes(text: string): number | null {
  const t = text.toLowerCase();
  const re = /(\d+(?:\.\d+)?)\s*(days?|d|hours?|hrs?|h|minutes?|mins?|m)\b/g;
  let total = 0;
  let found = false;
  let match: RegExpExecArray | null;
  while ((match = re.exec(t)) !== null) {
    const n = parseFloat(match[1]);
    const unit = match[2][0];
    if (unit === "d") total += n * 1440;
    else if (unit === "h") total += n * 60;
    else total += n;
    found = true;
  }
  return found && total > 0 ? total : null;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (d || h) parts.push(`${h}h`);
  if (d || h || m) parts.push(`${m}m`);
  parts.push(`${String(s).padStart(2, "0")}s`);
  return parts.join(" ");
}

function isTimer(value: unknown): value is Timer {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.key === "string" &&
    typeof o.name === "string" &&
    typeof o.startedAt === "number" &&
    typeof o.endsAt === "number" &&
    (o.maxEndsAt === undefined || typeof o.maxEndsAt === "number")
  );
}

const gold = "#e7b457";
const textShadow = "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)";

const h2Style = {
  textShadow: "0 2px 6px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.9)",
  fontSize: "2.7rem",
  color: gold,
  fontWeight: 400,
  lineHeight: 1.1,
} as const;

export default function TimersClient({ crops }: { crops: Crop[] }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setTimers(parsed.filter(isTimer));
      }
    } catch {
      // sem acesso ao armazenamento: começa vazio
    }
    setLoaded(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {
      // ignora
    }
  }, [timers, loaded]);

  const cropStarters = useMemo<Starter[]>(() => {
    const list: Starter[] = [];
    for (const c of crops) {
      const m = toMinutes(c.growth_time);
      if (m === null) continue;
      list.push({
        id: `crop-${c.id}`,
        name: c.name,
        label: c.growth_time,
        minMinutes: m,
        maxMinutes: m,
        image_url: c.image_url,
      });
    }
    return list;
  }, [crops]);

  const q = query.trim().toLowerCase();
  const shownCrops = cropStarters.filter((s) => s.name.toLowerCase().includes(q));
  const shownRespawns = RESPAWNS.filter((s) => s.name.toLowerCase().includes(q));

  const sorted = useMemo(
    () => [...timers].sort((a, b) => a.endsAt - b.endsAt),
    [timers]
  );

  function start(s: Starter) {
    const t = Date.now();
    const timer: Timer = {
      key: `${s.id}-${t}-${Math.random().toString(36).slice(2, 6)}`,
      name: s.name,
      startedAt: t,
      endsAt: t + s.minMinutes * 60000,
      maxEndsAt: s.maxMinutes > s.minMinutes ? t + s.maxMinutes * 60000 : undefined,
    };
    setTimers((prev) => [...prev, timer]);
  }

  function restart(timer: Timer) {
    const t = Date.now();
    const duration = timer.endsAt - timer.startedAt;
    const maxDuration = timer.maxEndsAt !== undefined ? timer.maxEndsAt - timer.startedAt : undefined;
    setTimers((prev) =>
      prev.map((x) =>
        x.key === timer.key
          ? {
              ...x,
              startedAt: t,
              endsAt: t + duration,
              maxEndsAt: maxDuration !== undefined ? t + maxDuration : undefined,
            }
          : x
      )
    );
  }

  function remove(key: string) {
    setTimers((prev) => prev.filter((x) => x.key !== key));
  }

  function clearFinished() {
    const t = Date.now();
    setTimers((prev) => prev.filter((x) => (x.maxEndsAt ?? x.endsAt) > t));
  }

  if (!loaded) return <p style={{ color: gold, textShadow }}>Loading…</p>;

  const finishedCount = sorted.filter((t) => (t.maxEndsAt ?? t.endsAt) <= now).length;

  function renderGrid(list: Starter[]) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        {list.map((s) => (
          <button key={s.id} type="button" onClick={() => start(s)} className="tm-start">
            <TextBox raw>
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt=""
                  width={48}
                  height={48}
                  style={{ objectFit: "contain", display: "block", margin: "0 auto 4px" }}
                />
              ) : null}
              <div className="tb-label">{s.name}</div>
              <div className="tb-value">{s.label}</div>
            </TextBox>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .tm-start {
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          background: none;
          font: inherit;
          color: inherit;
          cursor: pointer;
        }
        .tm-btn {
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          border-radius: 999px;
          padding: 4px 14px;
          font-size: 1rem;
          font-family: inherit;
          cursor: pointer;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .tm-search {
          width: 100%;
          max-width: 320px;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          font-size: 1rem;
          font-family: inherit;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .tm-search::placeholder { color: #e7b457; opacity: 1; }
        @media (hover: hover) {
          .tm-btn:hover, .tm-search:hover {
            border-color: #f0c46a;
            box-shadow: 0 0 16px rgba(240,196,106,0.6);
          }
        }
      `}</style>

      <section style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
          <h2 className={heading.className} style={{ ...h2Style, margin: 0 }}>
            Running timers
          </h2>
          {finishedCount > 0 && (
            <button type="button" onClick={clearFinished} className="tm-btn">
              Clear finished
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: gold, textShadow, margin: 0, fontSize: "1.15rem" }}>
            No timers yet. Press a crop or a respawn below to start one.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 14, maxWidth: 560 }}>
            {sorted.map((t) => {
              const total = t.endsAt - t.startedAt;
              const left = t.endsAt - now;
              const windowLeft = t.maxEndsAt !== undefined ? t.maxEndsAt - now : 0;
              const phase = left > 0 ? "waiting" : windowLeft > 0 ? "window" : "ready";
              const pct = Math.min(100, Math.max(0, ((now - t.startedAt) / total) * 100));
              return (
                <TextBox key={t.key} raw>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    <div className="tb-label" style={{ margin: 0, textAlign: "left", fontWeight: 700 }}>
                      {t.name}
                    </div>
                    <div className="tb-value" style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {phase === "waiting"
                        ? formatRemaining(left)
                        : phase === "window"
                        ? "Might be ready"
                        : "Ready!"}
                    </div>
                  </div>
                  <div
                    style={{
                      height: 8,
                      width: "100%",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.12)",
                      margin: "8px 0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: phase === "waiting" ? "var(--hv-link)" : gold,
                        transition: "width 1s linear",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => restart(t)} className="tm-btn">
                      Restart
                    </button>
                    <button type="button" onClick={() => remove(t.key)} className="tm-btn">
                      Remove
                    </button>
                  </div>
                </TextBox>
              );
            })}
          </div>
        )}
      </section>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        aria-label="Search timers"
        className="tm-search"
        style={{ marginBottom: 28 }}
      />

      <section style={{ marginBottom: 36 }}>
        <h2 className={heading.className} style={{ ...h2Style, margin: "0 0 14px" }}>
          Crops
        </h2>
        {shownCrops.length > 0 ? (
          renderGrid(shownCrops)
        ) : (
          <p style={{ color: gold, textShadow, fontSize: "1.15rem" }}>No crops match.</p>
        )}
      </section>

      <section>
        <h2 className={heading.className} style={{ ...h2Style, margin: "0 0 6px" }}>
          Respawns during the day
        </h2>
        <p style={{ color: gold, textShadow, fontSize: "1.05rem", margin: "0 0 14px" }}>
          Approximate times. When there is a range, the timer shows “Might be ready” until the longest time.
        </p>
        {shownRespawns.length > 0 ? (
          renderGrid(shownRespawns)
        ) : (
          <p style={{ color: gold, textShadow, fontSize: "1.15rem" }}>No respawns match.</p>
        )}
      </section>
    </div>
  );
}