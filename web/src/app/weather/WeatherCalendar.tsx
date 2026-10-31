"use client";

import { useEffect, useState } from "react";
import { WEATHER_TYPES, WINDOWS } from "./weatherTypes";

type DayMap = Record<string, (string | null)[]>;

const gold = "#e7b457";
const muted = "#e7b457";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function WeatherIcon({ type, size = 20 }: { type: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!type) return <span style={{ display: "inline-block", width: size, height: size, opacity: 0.3 }}>·</span>;
  const info = WEATHER_TYPES.find((w) => w.key === type);
  if (failed || !info) {
    return (
      <span title={info?.label ?? type} style={{ fontSize: size * 0.85, lineHeight: 1 }}>
        {info?.emoji ?? "?"}
      </span>
    );
  }
  return (
    <img
      src={`/weather-icons/${type}.png`}
      alt={info.label}
      title={info.label}
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={() => setFailed(true)}
    />
  );
}

export default function WeatherCalendar({ days }: { days: DayMap }) {
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [today, setToday] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setToday(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }, []);

  if (!cursor) return <p style={{ color: muted }}>Loading…</p>;

  const { y, m } = cursor;
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  const key = (d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  function shift(delta: number) {
    const date = new Date(y, m + delta, 1);
    setCursor({ y: date.getFullYear(), m: date.getMonth() });
    setSelected(null);
  }

  const sel = selected ? days[selected] : undefined;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {MONTHS.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setCursor({ y, m: i });
              setSelected(null);
            }}
            style={{
              ...pill,
              background: i === m ? gold : "transparent",
              color: i === m ? "#021432" : gold,
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button type="button" onClick={() => shift(-1)} style={pill} aria-label="Previous month">
          ←
        </button>
        <strong style={{ color: gold }}>
          {MONTHS[m]} {y}
        </strong>
        <button type="button" onClick={() => shift(1)} style={pill} aria-label="Next month">
          →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ color: muted, fontSize: "0.75rem", textAlign: "center" }}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} />;
          const k = key(d);
          const data = days[k];
          const isToday = k === today;
          const isSel = k === selected;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSelected(k)}
              style={{
                background: isSel ? "#12408f" : "#0a2a5c",
                border: isToday ? "1px solid #e7b457" : "1px solid rgba(231,180,87,0.15)",
                borderRadius: 8,
                padding: 4,
                minHeight: 62,
                color: "#e8f4ff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: isToday ? "#e7b457" : muted }}>{d}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4 }}>
                {data ? data.map((t, j) => <WeatherIcon key={j} type={t} size={16} />) : null}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: 16, background: "#0a2a5c", borderRadius: 12, padding: 14, maxWidth: 420 }}>
          <strong style={{ color: gold }}>{selected}</strong>
          {sel ? (
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              {WINDOWS.map((w, i) => {
                const type = sel[i] ?? null;
                const info = WEATHER_TYPES.find((t) => t.key === type);
                return (
                  <div key={w} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: muted, width: 56, fontSize: "0.85rem" }}>{w}</span>
                    <WeatherIcon type={type} size={22} />
                    <span>{info?.label ?? (type ? type : "—")}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: muted, margin: "8px 0 0" }}>No data for this day yet.</p>
          )}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <div style={{ color: muted, fontSize: "0.8rem", marginBottom: 6 }}>
          Each day shows four 6-hour windows: {WINDOWS.join(" · ")}. Dates follow the real calendar.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {WEATHER_TYPES.map((t) => (
            <span key={t.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
              <WeatherIcon type={t.key} size={18} /> {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const pill: React.CSSProperties = {
  border: "1px solid rgba(231,180,87,0.4)",
  background: "transparent",
  color: gold,
  borderRadius: 999,
  padding: "4px 12px",
  fontSize: "0.85rem",
  cursor: "pointer",
};
