"use client";

import { useProgress } from "../lib/progress";

export type CollectionTile = { href: string; label: string; icon?: string; keys: string[] };

export default function CollectionsGrid({ tiles }: { tiles: CollectionTile[] }) {
  const progress = useProgress();

  return (
    <>
      <style>{`
        .hub-grid {
          --hub-gap: 10px;
          --hub-cols: 3;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--hub-gap);
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (min-width: 720px) {
          .hub-grid {
            --hub-gap: 16px;
            --hub-cols: 5;
            max-width: 1100px;
          }
        }

        .hub-card {
          position: relative;
          isolation: isolate;
          flex: 0 0 calc((100% - (var(--hub-cols) - 1) * var(--hub-gap)) / var(--hub-cols));
          aspect-ratio: 5 / 8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 4%;
          padding: 14% 18% 23%;
          box-sizing: border-box;
          text-align: center;
          text-decoration: none;
          color: #e7b457;
          font-weight: 600;
          transition: transform 0.2s ease;
        }
        .hub-card::before {
          content: "";
          position: absolute;
          inset: 3% 4%;
          border-radius: 8% / 5.5%;
          background: linear-gradient(160deg, rgba(13,50,112,0.5), rgba(7,26,68,0.5));
          z-index: -1;
          transition: box-shadow 0.25s ease;
        }
        .hub-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: url(/ui/card_menu.webp) center / 100% 100% no-repeat;
          pointer-events: none;
          z-index: -1;
        }
        .hub-card:hover {
          transform: translateY(-4px);
        }
        .hub-card:hover::before {
          box-shadow: 0 3px 14px rgba(231,180,87,0.6);
        }
        .hub-icon {
          width: 80%;
          aspect-ratio: 1 / 1;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hub-icon img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .hub-label {
          flex: none;
          min-height: 2.3em;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          font-size: clamp(0.7rem, 1.1vw, 1rem);
          line-height: 1.15;
          text-shadow: 0 2px 6px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.9);
        }
        .hub-foot {
          width: 100%;
          margin-top: auto;
        }
        .hub-count {
          font-size: clamp(0.66rem, 1vw, 0.9rem);
          font-weight: 400;
          color: #e7b457;
          text-shadow: 0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9);
        }
        .hub-bar {
          width: 100%;
          height: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          overflow: hidden;
          margin-top: 4px;
        }
      `}</style>
      <div className="hub-grid">
        {tiles.map((t) => {
          const total = t.keys.length;
          const done = t.keys.filter((k) => progress.has(k)).length;
          const percent = total ? Math.round((done / total) * 100) : 0;
          return (
            <a key={t.href} href={t.href} className="hub-card">
              <div className="hub-icon">{t.icon ? <img src={t.icon} alt="" /> : null}</div>
              <span className="hub-label">{t.label}</span>
              <div className="hub-foot">
                {total > 0 && (
                  <>
                    <div className="hub-count">
                      {done} / {total}
                    </div>
                    <div className="hub-bar">
                      <div style={{ width: `${percent}%`, height: "100%", background: "#e7b457" }} />
                    </div>
                  </>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}