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
    note?: string;
  crop?: boolean;
};

type Timer = {
  key: string;
  name: string;
  startedAt: number;
  endsAt: number;
  maxEndsAt?: number;
  crop?: boolean;
  alerts?: string[];
};

type Settings = { notify: boolean; weeds: boolean };
type Filter = "all" | "crops" | "resources";

const STORAGE_KEY = "hv_timers_v1";
const SETTINGS_KEY = "hv_timers_settings_v1";

// Respawns ao longo do dia
const RESPAWNS: Starter[] = [
  { id: "branch", name: "Branch", note: "From bushes", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "timber", name: "Timber", note: "Trees near home", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "quality-timber", name: "Quality Timber", note: "For quick collection, go to the forest on the island's east", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "rare-timber", name: "Rare Timber", note: "8 special big trees", label: "2 h", minMinutes: 120, maxMinutes: 120 },
  { id: "stone", name: "Stone", label: "5 min", minMinutes: 5, maxMinutes: 5 },
  { id: "ore", name: "Ore", label: "5 min", minMinutes: 5, maxMinutes: 5 },
  { id: "apple", name: "Apple", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "mandarin", name: "Mandarin", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "blueberry", name: "Blueberry", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "raspberry", name: "Raspberry", label: "2 min", minMinutes: 2, maxMinutes: 2 },
  { id: "penny-bun", name: "Penny Bun", note: "Forest", label: "2 min 30 s", minMinutes: 2.5, maxMinutes: 2.5 },
  { id: "black-truffle", name: "Black Truffle", note: "Forest Island", label: "15 min", minMinutes: 15, maxMinutes: 15 },
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

function sendNotification(title: string, body: string) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    // este navegador não deixa mostrar notificações
  }
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
  const [filter, setFilter] = useState<Filter>("all");
  const [settings, setSettings] = useState<Settings>({ notify: false, weeds: false });
  const [notifyMsg, setNotifyMsg] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setTimers(parsed.filter(isTimer));
      }
      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const s = JSON.parse(rawSettings) as Partial<Settings>;
        setSettings({ notify: s.notify === true, weeds: s.weeds === true });
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

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignora
    }
  }, [settings, loaded]);

  // Avisos: ervas daninhas (só crops) e "pronto"
  useEffect(() => {
    if (!loaded || !settings.notify || now === 0) return;
    const updates: Record<string, string[]> = {};
    for (const t of timers) {
      const done = t.alerts ?? [];
      const total = t.endsAt - t.startedAt;
      const stages: { id: string; at: number; title: string; body: string }[] = [];
      if (t.crop && settings.weeds) {
        stages.push(
          { id: "w1", at: t.startedAt + total / 3, title: `Weeds: ${t.name}`, body: "First wave of weeds has appeared." },
          { id: "w2", at: t.startedAt + (total * 2) / 3, title: `Weeds: ${t.name}`, body: "Second wave of weeds has appeared." },
          { id: "w3", at: t.endsAt - 30000, title: `Weeds: ${t.name}`, body: "Last weeds! Harvest in 30 seconds." }
        );
      }
      stages.push({
        id: "ready",
        at: t.endsAt,
        title: t.name,
        body: t.maxEndsAt !== undefined ? "Might be ready!" : "Ready!",
      });
      let changed = false;
      const nextDone = [...done];
      for (const s of stages) {
        if (nextDone.includes(s.id) || now < s.at) continue;
        // se o aviso já passou há muito (página estava fechada), marca sem avisar
        if (now - s.at <= 60000) sendNotification(s.title, s.body);
        nextDone.push(s.id);
        changed = true;
      }
      if (changed) updates[t.key] = nextDone;
    }
    if (Object.keys(updates).length > 0) {
      setTimers((prev) => prev.map((x) => (updates[x.key] ? { ...x, alerts: updates[x.key] } : x)));
    }
  }, [now, loaded, settings, timers]);

  async function toggleNotify() {
    if (settings.notify) {
      setSettings((s) => ({ ...s, notify: false }));
      return;
    }
    if (typeof Notification === "undefined") {
      setNotifyMsg("This browser does not support desktop notifications.");
      return;
    }
    let perm: NotificationPermission = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifyMsg("");
      setSettings((s) => ({ ...s, notify: true }));
    } else {
      setNotifyMsg("Notifications are blocked. Allow them for this site in your browser settings.");
    }
  }

  function toggleWeeds() {
    setSettings((s) => ({ ...s, weeds: !s.weeds }));
  }

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
        crop: true,
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
      crop: s.crop === true ? true : undefined,
      alerts: [],
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
              alerts: [],
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
              {s.note ? <div style={{ fontSize: "0.95rem", opacity: 0.85, marginBottom: 4 }}>{s.note}</div> : null}
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
          padding: 9px 18px;
          font-size: 1rem;
          font-family: inherit;
          cursor: pointer;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .tm-btn.on {
          background: rgba(231,180,87,0.22);
          border-color: #f0c46a;
          box-shadow: 0 0 12px rgba(240,196,106,0.45);
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
        <button type="button" onClick={toggleNotify} className={`tm-btn${settings.notify ? " on" : ""}`}>
          Desktop notifications: {settings.notify ? "On" : "Off"}
        </button>
        <button type="button" onClick={toggleWeeds} className={`tm-btn${settings.weeds ? " on" : ""}`}>
          Weed alerts: {settings.weeds ? "On" : "Off"}
        </button>
      </div>
      <p style={{ color: gold, textShadow, fontSize: "1.05rem", margin: "0 0 28px" }}>
        {notifyMsg
          ? notifyMsg
          : settings.weeds && !settings.notify
          ? "Turn on desktop notifications to receive the weed alerts."
          : "Weed alerts (crops only): when 1/3 and 2/3 of the growth time have passed, and in the last 30 seconds."}
      </p>

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
            No timers yet. Press a crop or a resource below to start one.
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

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search timers"
          className="tm-search"
        />
        <button type="button" onClick={() => setFilter("all")} className={`tm-btn${filter === "all" ? " on" : ""}`}>
          All
        </button>
        <button type="button" onClick={() => setFilter("crops")} className={`tm-btn${filter === "crops" ? " on" : ""}`}>
          Crops
        </button>
        <button
          type="button"
          onClick={() => setFilter("resources")}
          className={`tm-btn${filter === "resources" ? " on" : ""}`}
        >
          World Resources
        </button>
      </div>

      {filter !== "resources" && (
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
      )}

      {filter !== "crops" && (
        <section>
          <h2 className={heading.className} style={{ ...h2Style, margin: "0 0 14px" }}>
            World Resources
          </h2>
          {shownRespawns.length > 0 ? (
            renderGrid(shownRespawns)
          ) : (
            <p style={{ color: gold, textShadow, fontSize: "1.15rem" }}>No resources match.</p>
          )}
        </section>
      )}
    </div>
  );
}