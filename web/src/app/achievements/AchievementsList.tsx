"use client";

import { useEffect, useState } from "react";

export type Achievement = {
  id: number;
  name: string;
  objective: string;
  title: string;
  image: string | null;
};

const KEY = "hv_achievements_v1";

export default function AchievementsList({ items }: { items: Achievement[] }) {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setDone(arr.map(Number));
      }
    } catch {
      /* sem armazenamento: fica vazio */
    }
  }, []);

  function toggle(id: number) {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignora */
      }
      return next;
    });
  }

  return (
    <>
      <style>{`
        .ach-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
          gap: 20px;
        }
        .ach-card {
          position: relative;
          isolation: isolate;
          container-type: inline-size;
          aspect-ratio: 2 / 3;
          color: #e7b457;
          transition: transform 0.25s ease, filter 0.25s ease;
        }
        .ach-card:hover { transform: translateY(-4px); filter: drop-shadow(0 0 8px rgba(255, 205, 90, 0.9)) drop-shadow(0 0 20px rgba(255, 196, 80, 0.6)); }
        .ach-fill, .ach-frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 9% / 6%;
        }
        .ach-fill { z-index: 0; background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5)); transition: background 0.6s ease; }
        .ach-frame { z-index: 0; background: url(/ui/card_objeto.webp) center / 100% 100% no-repeat; transition: filter 0.6s ease; }

        /* por obter: preto e branco; obtido: acende com luz azul */
        .ach-off .ach-frame, .ach-off .ach-art img { filter: grayscale(1) brightness(0.85); }
        .ach-off .ach-name, .ach-off .ach-info { color: #b3ad9d; }
        .ach-on .ach-frame { filter: drop-shadow(0 0 6px rgba(120, 190, 255, 0.7)); }
        .ach-on .ach-fill { background: linear-gradient(160deg, rgba(18, 64, 138, 0.5), rgba(8, 35, 90, 0.5)); }

        .ach-art {
          position: absolute;
          z-index: 1;
          left: 10%;
          right: 10%;
          top: 7%;
          height: 44%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ach-art img { display: block; max-width: 88%; max-height: 92%; object-fit: contain; transition: filter 0.6s ease; }

        /* nome: por cima da linha dourada, mais pequeno para não bater nas folhas */
        .ach-name {
          position: absolute;
          z-index: 1;
          left: 17%;
          right: 17%;
          top: 52%;
          height: 16%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'EB Garamond', Georgia, serif;
          font-weight: 700;
          font-size: 6.4cqw;
          line-height: 1.1;
          color: #e7b457;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.7);
        }

        /* info: por baixo da linha dourada, tudo centrado */
        .ach-info {
          position: absolute;
          z-index: 1;
          left: 14%;
          right: 14%;
          top: 70%;
          bottom: 5%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5cqw;
          text-align: center;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 5.2cqw;
          line-height: 1.15;
          color: #e7b457;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 6px rgba(0, 0, 0, 0.7);
        }
        .ach-label { font-weight: 700; }
        .ach-mission {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ach-reward { font-weight: 700; }

        /* star_5 no canto de cima à direita */
        .ach-own {
          position: absolute;
          z-index: 2;
          right: 11%;
          top: 5%;
          width: 14cqw;
          height: 14cqw;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          line-height: 0;
        }

        /* por obter: estrela cinzenta com brilho dourado à volta (a respirar); obtida: a cores */
        .ach-own img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(1) brightness(0.8) drop-shadow(0 0 3px rgba(255, 205, 90, 0.8)) drop-shadow(0 0 7px rgba(255, 205, 90, 0.55));
          animation: achGlow 2.8s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .ach-own:hover img { transform: scale(1.12); }
        .ach-own.lit img {
          filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95));
          animation: none;
        }
        @keyframes achGlow {
          0%, 100% { filter: grayscale(1) brightness(0.8) drop-shadow(0 0 2px rgba(255, 205, 90, 0.5)) drop-shadow(0 0 4px rgba(255, 205, 90, 0.3)); }
          50% { filter: grayscale(1) brightness(0.8) drop-shadow(0 0 4px rgba(255, 205, 90, 0.95)) drop-shadow(0 0 9px rgba(255, 205, 90, 0.7)); }
        }

        @media (max-width: 560px) {
          .ach-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }
      `}</style>

      <div className="ach-grid">
        {items.map((a) => {
          const on = done.includes(a.id);
          return (
            <div key={a.id} className={`ach-card ${on ? "ach-on" : "ach-off"}`}>
              <div className="ach-fill" />
              <div className="ach-frame" />
              <div className="ach-art">{a.image ? <img src={a.image} alt="" loading="lazy" /> : null}</div>
              <div className="ach-name">{a.name}</div>
              <div className="ach-info">
                {a.objective && (
                  <div className="ach-mission">
                    <span className="ach-label">Mission:</span> {a.objective}
                  </div>
                )}
                {a.title && (
                  <div>
                    <span className="ach-label">Title reward:</span> <span className="ach-reward">{a.title}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`ach-own${on ? " lit" : ""}`}
                aria-pressed={on}
                aria-label={on ? `Unmark ${a.name}` : `Mark ${a.name} as obtained`}
                onClick={() => toggle(a.id)}
              >
                <img src="/stars/star_5.webp" alt="" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}