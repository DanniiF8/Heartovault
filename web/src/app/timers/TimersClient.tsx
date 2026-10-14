"use client";

import { useEffect, useMemo, useState } from "react";

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
const muted = "#94a3b8";

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

  if (!loaded) return <p style={{ color: muted }}>Loading…</p>;

  const finishedCount = sorted.filter((t) => (t.maxEndsAt ?? t.endsAt) <= now).length;

  function renderGrid(list: Starter[]) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 10,
        }}
      >
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => start(s)}
            style={{
              background: "#0a2a5c",
              border: "1px solid rgba(231,180,87,0.25)",
              borderRadius: 12,
              padding: 12,
              color: gold,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {s.image_url ? (
              <img
                src={s.image_url}
                alt=""
                width={48}
                height={48}
                style={{ objectFit: "contain", display: "block", margin: "0 auto 6px" }}
              />
            ) : null}
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.name}</div>
            <div style={{ color: muted, fontSize: "0.8rem", marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: "1.15rem", margin: 0, color: gold }}>Running timers</h2>
          {finishedCount > 0 && (
            <button type="button" onClick={clearFinished} style={smallButton}>
              Clear finished
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: muted, margin: 0 }}>
            No timers yet. Press a crop or a respawn below to start one.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
            {sorted.map((t) => {
              const total = t.endsAt - t.startedAt;
              const left = t.endsAt - now;
              const windowLeft = t.maxEndsAt !== undefined ? t.maxEndsAt - now : 0;
              const phase = left > 0 ? "waiting" : windowLeft > 0 ? "window" : "ready";
              const pct = Math.min(100, Math.max(0, ((now - t.startedAt) / total) * 100));
              return (
                <div
                  key={t.key}
                  style={{
                    background: "linear-gradient(160deg, #0d3270, #071a44)",
                    border:
                      phase === "ready"
                        ? "1px solid rgba(243,217,139,0.9)"
                        : phase === "window"
                        ? "1px solid rgba(243,217,139,0.55)"
                        : "1px solid rgba(231,180,87,0.25)",
                    boxShadow: phase === "ready" ? "0 0 16px rgba(243,217,139,0.35)" : "none",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ color: gold }}>{t.name}</strong>
                    <span
                      style={{
                        color: phase === "waiting" ? "#e8f4ff" : "#f3d98b",
                        fontVariantNumeric: "tabular-nums",
                        textAlign: "right",
                      }}
                    >
                      {phase === "waiting"
                        ? formatRemaining(left)
                        : phase === "window"
                        ? "Might be ready"
                        : "Ready!"}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.12)",
                      margin: "10px 0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: phase === "waiting" ? "#3ec1e6" : "#f3d98b",
                        transition: "width 1s linear",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => restart(t)} style={smallButton}>
                      Restart
                    </button>
                    <button type="button" onClick={() => remove(t.key)} style={smallButton}>
                      Remove
                    </button>
                  </div>
                </div>
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
        style={{
          width: "100%",
          maxWidth: 320,
          marginBottom: 20,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid rgba(231,180,87,0.4)",
          background: "#021432",
          color: "#e8f4ff",
        }}
      />

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.15rem", margin: "0 0 12px", color: gold }}>Crops</h2>
        {shownCrops.length > 0 ? renderGrid(shownCrops) : <p style={{ color: muted }}>No crops match.</p>}
      </section>

      <section>
        <h2 style={{ fontSize: "1.15rem", margin: "0 0 4px", color: gold }}>Respawns during the day</h2>
        <p style={{ color: muted, fontSize: "0.85rem", margin: "0 0 12px" }}>
          Approximate times. When there is a range, the timer shows “Might be ready” until the longest time.
        </p>
        {shownRespawns.length > 0 ? renderGrid(shownRespawns) : <p style={{ color: muted }}>No respawns match.</p>}
      </section>
    </div>
  );
}

const smallButton: React.CSSProperties = {
  border: "1px solid rgba(231,180,87,0.4)",
  background: "transparent",
  color: gold,
  borderRadius: 999,
  padding: "4px 12px",
  fontSize: "0.8rem",
  cursor: "pointer",
};
