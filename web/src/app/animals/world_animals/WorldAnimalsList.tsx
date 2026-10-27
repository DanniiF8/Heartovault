"use client";

import { useState } from "react";
import { useProgress } from "../../lib/progress";

export type WorldAnimal = {
  id: number;
  name: string;
};

type Status = "all" | "on" | "off";
type SortBy = "game" | "name";

export default function WorldAnimalsList({ items }: { items: WorldAnimal[] }) {
  const progress = useProgress();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [sortBy, setSortBy] = useState<SortBy>("game");

  const keyOf = (id: number) => `world_animal:${id}`;

  const needle = q.trim().toLowerCase();
  const filtered = items.filter((a) => {
    const isOn = progress.has(keyOf(a.id));
    if (status === "on" && !isOn) return false;
    if (status === "off" && isOn) return false;
    if (!needle) return true;
    return a.name.toLowerCase().includes(needle);
  });
  const shown =
    sortBy === "name" ? [...filtered].sort((x, y) => x.name.localeCompare(y.name)) : filtered;

  const filters: { key: Status; label: string }[] = [
    { key: "all", label: "Show All" },
    { key: "on", label: "Obtained" },
    { key: "off", label: "Missing" },
  ];

  return (
    <>
      <style>{`
        .wa-ctl {
          background: rgba(0, 16, 40, 0.88);
          border: 1px solid rgba(231, 180, 87, 0.35);
          color: #e7b457;
          font-family: 'EB Garamond', Georgia, serif;
          transition: box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .wa-ctl:hover {
          border-color: #f0c46a;
          box-shadow: 0 0 16px rgba(240, 196, 106, 0.6);
        }
        .wa-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .wa-search {
          flex: 1 1 260px;
          max-width: 400px;
          min-width: 0;
          padding: 16px 22px;
          font-size: 16px;
          border-radius: 30px;
          outline: none;
        }
        .wa-search::placeholder { color: rgba(231, 180, 87, 0.7); }
        .wa-search::-webkit-search-cancel-button {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          width: 14px;
          cursor: pointer;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e7b457' stroke-width='3.5' stroke-linecap='round'%3E%3Cpath d='M5 5l14 14M19 5L5 19'/%3E%3C/svg%3E") center / contain no-repeat;
        }
        .wa-search:focus { border-color: #f0c46a; box-shadow: 0 0 16px rgba(240, 196, 106, 0.6); }
        .wa-pill {
          padding: 14px 24px;
          font-size: 1rem;
          border-radius: 999px;
          cursor: pointer;
        }
        .wa-pill.sel {
          background: rgba(231, 180, 87, 0.22);
          border-color: #f0c46a;
          box-shadow: 0 0 12px rgba(240, 196, 106, 0.5);
          color: #e7b457;
          font-weight: 600;
        }
        .wa-sel {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'EB Garamond', Georgia, serif;
          color: #e7b457;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 1), 0 0 12px rgba(0, 0, 0, 0.9);
        }
        .wa-select {
          padding: 12px 14px;
          font-size: 1rem;
          border-radius: 16px;
          cursor: pointer;
          outline: none;
          color-scheme: dark;
        }
        .wa-select option { background: #0a1230; color: #e7b457; }
        .wa-count {
          width: 100%;
          margin: 0 0 12px;
          font-family: 'EB Garamond', Georgia, serif;
          color: #e7b457;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 1), 0 0 12px rgba(0, 0, 0, 0.9);
        }
        .wa-empty {
          text-align: center;
          padding: 30px 0;
          font-family: 'EB Garamond', Georgia, serif;
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
          aspect-ratio: 2 / 3;
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
        .wa-frame { z-index: 0; background: url(/ui/card_objeto.webp) center / 100% 100% no-repeat; transition: filter 0.6s ease; }

        .wa-off .wa-frame { filter: grayscale(1) brightness(0.85); }
        .wa-off .wa-name { color: #a0a0a0; }
        .wa-on .wa-frame { filter: drop-shadow(0 0 6px rgba(120, 190, 255, 0.7)); }
        .wa-on .wa-fill { background: linear-gradient(160deg, rgba(18, 64, 138, 0.5), rgba(8, 35, 90, 0.5)); }

        .wa-art {
          position: absolute;
          z-index: 1;
          left: 10%;
          right: 10%;
          top: 7%;
          height: 44%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .wa-none { opacity: 0.35; font-size: 6cqw; font-family: 'EB Garamond', Georgia, serif; }

        /* nome: por baixo da linha dourada, como o texto dos Achievements */
        .wa-name {
          position: absolute;
          z-index: 1;
          left: 14%;
          right: 14%;
          top: 70%;
          bottom: 5%;
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
          .wa-pill { padding: 12px 18px; }
          .wa-search { max-width: none; }
        }
      `}</style>

      <div className="wa-bar">
        <input
          type="search"
          className="wa-ctl wa-search"
          placeholder="Search animals..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`wa-ctl wa-pill${status === f.key ? " sel" : ""}`}
            aria-pressed={status === f.key}
            onClick={() => setStatus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="wa-bar">
        <label className="wa-sel">
          Sort by
          <select
            className="wa-ctl wa-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="game">Game order</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <p className="wa-count">
        {shown.length} / {items.length} animals
      </p>

      {shown.length === 0 ? (
        <div className="wa-empty">No animals found.</div>
      ) : (
        <div className="wa-grid">
          {shown.map((a) => {
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
      )}
    </>
  );
}