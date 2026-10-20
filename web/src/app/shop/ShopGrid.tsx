"use client";

import { itemKey, useProgress } from "../lib/progress";

export type ShopCard = { id: number; name: string; price: string; image_url: string | null };

export default function ShopGrid({ items }: { items: ShopCard[] }) {
  const progress = useProgress();
  const count = items.filter((i) => progress.has(itemKey({ name: i.name }))).length;
  const percent = items.length ? Math.round((count / items.length) * 100) : 0;

  return (
    <div>
      <div style={{ maxWidth: 360, marginBottom: 20 }}>
        <div style={{ color: "#e7b457", fontSize: "0.9rem", marginBottom: 4 }}>
          Obtained {count} / {items.length} ({percent}%)
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: "#e7b457", transition: "width 0.3s" }} />
        </div>
        <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 4 }}>
          Your progress is saved in this browser.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((item) => {
          const key = itemKey({ name: item.name });
          const owned = progress.has(key);
          return (
            <div
              key={item.id}
              style={{
                position: "relative",
                background: "#0a2a5c",
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
                border: owned ? "2px solid #e7b457" : "2px solid transparent",
                boxShadow: owned ? "0 0 14px rgba(231,180,87,0.45)" : "none",
              }}
            >
              <button
                type="button"
                aria-pressed={owned}
                aria-label={owned ? `Unmark ${item.name}` : `Mark ${item.name} as obtained`}
                onClick={() => progress.toggle(key)}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                  border: "1px solid rgba(231,180,87,0.7)",
                  background: owned ? "#e7b457" : "rgba(2,20,50,0.75)",
                  color: owned ? "#021432" : "transparent",
                }}
              >
                ✓
              </button>
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt=""
                  width={72}
                  height={72}
                  style={{ objectFit: "contain", marginBottom: 8 }}
                />
              ) : null}
              <div style={{ color: "#e7b457", fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
              <div style={{ color: "#e8f4ff", fontSize: "0.85rem", marginTop: 6 }}>{item.price}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
