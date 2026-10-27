"use client";

import { useProgress } from "../../lib/progress";

export type WorldAnimal = {
  id: number;
  name: string;
};

export default function WorldAnimalsList({ items }: { items: WorldAnimal[] }) {
  const progress = useProgress();
  const keyOf = (id: number) => `world_animal:${id}`;
  const obtained = items.filter((a) => progress.has(keyOf(a.id))).length;

  return (
    <>
      <style>{`
        .wa-count {
          margin: 0 0 20px;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 1.15rem;
          color: #e7b457;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 1), 0 0 12px rgba(0, 0, 0, 0.9);
        }
        .wa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
          gap: 20px;
        }
        .wa-card {
          position: relative;
          isolation: isolate;
          container-type: inline-size;
          aspect-ratio: 3 / 4;
          color: #e7b457;
          transition: transform 0.25s ease;
        }
        .wa-card:hover { transform: translateY(-4px); }
        .wa-card:hover .wa-fill { box-shadow: 0 3px 14px rgba(231, 180, 87, 0.6); }
        .wa-fill, .wa-frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 9% / 6%;
        }
        .wa-fill { z-index: 0; background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5)); transition: background 0.6s ease, box-shadow 0.25s ease; }
        .wa-frame { z-index: 0; background: url(/ui/card_menu.webp) center / 100% 100% no-repeat; transition: filter 0.6s ease; }

        .wa-off .wa-frame { filter: grayscale(1) brightness(0.85); }
        .wa-off .wa-name { color: #a0a0a0; }
        .wa-on .wa-frame { filter: drop-shadow(0 0 6px rgba(120, 190, 255, 0.7)); }
        .wa-on .wa-fill { background: linear-gradient(160deg, rgba(18, 64, 138, 0.5), rgba(8, 35, 90, 0.5)); }

        .wa-art {
          position: absolute;
          z-index: 1;
          left: 12%;
          right: 12%;
          top: 14%;
          height: 48%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .wa-none { opacity: 0.35; font-size: 6cqw; font-family: 'EB Garamond', Georgia, serif; }

        .wa-name {
          position: absolute;
          z-index: 1;
          left: 12%;
          right: 12%;
          top: 66%;
          height: 20%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-decoration: none;
          font-family: 'EB Garamond', Georgia, serif;
          font-weight: 700;
          font-size: 8cqw;
          line-height: 1.1;
          color: #e7b457;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.7);
        }

        .wa-own {
          position: absolute;
          z-index: 2;
          right: 9%;
          top: 5%;
          width: 14cqw;
          height: 14cqw;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          line-height: 0;
        }
        .wa-own img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(1) brightness(0.8) drop-shadow(0 0 3px rgba(255, 205, 90, 0.8)) drop-shadow(0 0 7px rgba(255, 205, 90, 0.55));
          animation: waGlow 2.8s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .wa-own:hover img { transform: scale(1.12); }
        .wa-own.lit img {
          filter: drop-shadow(0 0 4px rgba(255, 215, 110, 0.95));
          animation: none;
        }
        @keyframes waGlow {
          0%, 100% { filter: grayscale(1) brightness(0.8) drop-shadow(0 0 2px rgba(255, 205, 90, 0.5)) drop-shadow(0 0 4px rgba(255, 205, 90, 0.3)); }
          50% { filter: grayscale(1) brightness(0.8) drop-shadow(0 0 4px rgba(255, 205, 90, 0.95)) drop-shadow(0 0 9px rgba(255, 205, 90, 0.7)); }
        }

        @media (max-width: 560px) {
          .wa-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }
      `}</style>

      <p className="wa-count">
        {obtained} / {items.length} animals
      </p>

      <div className="wa-grid">
        {items.map((a) => {
          const on = progress.has(keyOf(a.id));
          const href = `/animals/world_animals/${a.id}`;
          return (
            <div key={a.id} className={`wa-card ${on ? "wa-on" : "wa-off"}`}>
              <div className="wa-fill" />
              <div className="wa-frame" />
              <a href={href} className="wa-art" aria-label={a.name}>
                <div className="wa-none">No image</div>
              </a>
              <a href={href} className="wa-name">
                {a.name}
              </a>
              <button
                type="button"
                className={`wa-own${on ? " lit" : ""}`}
                aria-pressed={on}
                aria-label={on ? `Unmark ${a.name}` : `Mark ${a.name} as obtained`}
                onClick={() => progress.toggle(keyOf(a.id))}
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