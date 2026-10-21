"use client";

import { useProgress } from "../lib/progress";

export type CollectionTile = { href: string; label: string; icon?: string; keys: string[] };

export default function CollectionsGrid({ tiles }: { tiles: CollectionTile[] }) {
  const progress = useProgress();

  return (
    <>
      <style>{`
        /* a grelha fica centrada e, no computador, cabe toda no ecrã sem rolar:
           o tamanho dos cartões acompanha a altura da janela */
        .hub-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (min-width: 720px) {
          .hub-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            max-width: clamp(560px, calc((100vh - 231px) * 1.875 + 80px), 1000px);
          }
        }

        /* cartão = a moldura card_menu por cima de um fundo azul */
        .hub-card {
          aspect-ratio: 5 / 8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6%;
          padding: 14% 18% 23%;
          box-sizing: border-box;
          text-align: center;
          text-decoration: none;
          color: #e7b457;
          font-weight: 600;
          border-radius: 9%/6%;
          background:
            url(/ui/card_menu.webp) center / 100% 100% no-repeat,
            linear-gradient(160deg, #0d3270, #071a44);
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .hub-card:hover {
          transform: translateY(-4px);
          filter: drop-shadow(0 6px 14px rgba(231,180,87,0.35));
        }
        .hub-card img {
          display: block;
          width: 74%;
          height: auto;
          aspect-ratio: 1 / 1;
          object-fit: contain;
        }
        .hub-label {
          font-size: clamp(0.66rem, 1.02vw, 0.88rem);
          line-height: 1.15;
        }
        .hub-count {
          font-size: clamp(0.62rem, 0.9vw, 0.8rem);
          font-weight: 400;
          color: #94a3b8;
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
              {t.icon ? <img src={t.icon} alt="" /> : null}
              <span className="hub-label">{t.label}</span>
              {total > 0 && (
                <div style={{ width: "100%" }}>
                  <div className="hub-count">
                    {done} / {total}
                  </div>
                  <div className="hub-bar">
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