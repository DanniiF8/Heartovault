"use client";

import { useProgress } from "../lib/progress";

export type CollectionTile = { href: string; label: string; icon?: string; keys: string[] };

export default function CollectionsGrid({ tiles }: { tiles: CollectionTile[] }) {
  const progress = useProgress();

  return (
    <>
      <style>{`
        .hub-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 1000px;
        }
        @media (min-width: 720px) {
          .hub-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .hub-card img {
          display: block;
          width: 100%;
          max-width: 150px;
          height: auto;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          margin: 0 auto 12px;
        }
      `}</style>
      <div className="hub-grid">
        {tiles.map((t) => {
          const total = t.keys.length;
          const done = t.keys.filter((k) => progress.has(k)).length;
          const percent = total ? Math.round((done / total) * 100) : 0;
          return (
            <a
              key={t.href}
              href={t.href}
              className="hub-card"
              style={{
                background: "linear-gradient(160deg, #0d3270, #071a44)",
                border: "1px solid rgba(231,180,87,0.25)",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
                textDecoration: "none",
                color: "#e7b457",
                fontWeight: 600,
              }}
            >
              {t.icon ? <img src={t.icon} alt="" /> : null}
              {t.label}
              {total > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 400, color: "#94a3b8" }}>
                    {done} / {total}
                  </div>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.12)",
                      overflow: "hidden",
                      marginTop: 4,
                    }}
                  >
                    <div style={{ width: `${percent}%`, height: "100%", background: "#e7b457" }} />
                  </div>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </>
  );
}
