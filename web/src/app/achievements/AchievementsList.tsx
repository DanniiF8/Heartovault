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
          transition: transform 0.25s ease;
        }
        .ach-card:hover { transform: translateY(-3px); }
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
        .ach-off .ach-name { color: #b3ad9d; }
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

        /* nome: por cima da linha dourada */
        .ach-name {
          position: absolute;
          z-index: 1;
          left: 10%;
          right: 10%;
          top: 52%;
          height: 16%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'EB Garamond', Georgia, serif;
          font-weight: 700;
          font-size: 8cqw;
          line-height: 1.1;
          color: #e7b457;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.7);
        }

        /* info: por baixo da linha dourada */
        .ach-info {
          position: absolute;
          z-index: 1;
          left: 10%;
          right: 28%;
          top: 71%;
          bottom: 6%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.5cqw;
          text-align: left;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 5.4cqw;
          line-height: 1.15;
          color: #e7b457;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 6px rgba(0, 0, 0, 0.7);
        }
        .ach-off .ach-info { color: #b3ad9d; }
        .ach-mission {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ach-reward { font-weight: 700; }

        /* star_5 no canto: apagada = por obter, acesa = obtida */
        .ach-own {
          position: absolute;
          z-index: 2;
          right: 12%;
          bottom: 7%;
          width: 15cqw;
          height: 15cqw;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          line-height: 0;
        }
        .ach-own img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(1) brightness(0.7) opacity(0.55);
          transition: filter 0.3s ease, transform 0.2s ease;
        }
        .ach-own:hover img { filter: grayscale(0.3) brightness(0.95) opacity(0.85); transform: scale(1.12); }
        .ach-own.lit img { filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95)); }

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
                {a.objective && <div className="ach-mission">{a.objective}</div>}
                {a.title && <div className="ach-reward">{a.title}</div>}
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