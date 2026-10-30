"use client";

import { useEffect, useState } from "react";

export type Achievement = {
  id: number;
  name: string;
  objective: string;
  title: string;
  type: string;
  image: string | null;
};

const KEY = "hv_achievements_v1";

const SHADOW_TEXT = "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)";

type Status = "all" | "on" | "off";
type TypeFilter = "all" | "normal" | "hidden";
type SortBy = "game" | "name";

export default function AchievementsList({ items }: { items: Achievement[] }) {
  const [done, setDone] = useState<number[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("game");
  const [open, setOpen] = useState(false);

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

  const needle = q.trim().toLowerCase();
  const obtainedCount = items.filter((a) => done.includes(a.id)).length;
  const percent = items.length ? Math.round((obtainedCount / items.length) * 100) : 0;
  const filtered = items.filter((a) => {
    const isOn = done.includes(a.id);
    if (status === "on" && !isOn) return false;
    if (status === "off" && isOn) return false;
    if (typeFilter !== "all" && a.type.toLowerCase() !== typeFilter) return false;
    if (!needle) return true;
    return `${a.name} ${a.objective} ${a.title}`.toLowerCase().includes(needle);
  });
  const shown = sortBy === "name" ? [...filtered].sort((x, y) => x.name.localeCompare(y.name)) : filtered;

  const filters: { key: Status; label: string }[] = [
    { key: "all", label: "All" },
    { key: "on", label: "Obtained" },
    { key: "off", label: "Missing" },
  ];

  return (
    <>
      <style>{`
        /* controlos: iguais aos das listas (Gardening etc.) */
        .ach-search {
          flex: 0 1 280px;
          width: 280px;
          max-width: 100%;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ach-search::placeholder { color: #e7b457; opacity: 1; }
        .ach-search::-webkit-search-cancel-button {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          margin-left: 6px;
          cursor: pointer;
          background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M3 3l10 10M13 3L3 13' stroke='%23f0c46a' stroke-width='2' stroke-linecap='round'/></svg>") center / contain no-repeat;
        }
        .ach-pill {
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 1rem;
          font-family: inherit;
          cursor: pointer;
          text-transform: capitalize;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .ach-pill.on {
          background: rgba(231,180,87,0.22);
          border-color: #f0c46a;
          box-shadow: 0 0 12px rgba(240,196,106,0.45);
        }
        .ach-select {
          padding: 9px 14px;
          border-radius: 16px;
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
          color: #e7b457;
          font-size: 1rem;
          font-family: inherit;
          cursor: pointer;
          color-scheme: dark;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ach-select option { background: #021432; color: #e7b457; }
        @media (hover: hover) {
          .ach-search:hover, .ach-pill:hover, .ach-select:hover {
            border-color: #f0c46a;
            box-shadow: 0 0 16px rgba(240,196,106,0.6);
          }
        }
        .ach-field {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          color: #e7b457;
          font-size: 1rem;
        }
        .ach-box {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 22px;
          align-items: center;
          padding: 16px 18px;
          margin-bottom: 20px;
          border-radius: 16px;
          border: 1px solid rgba(231,180,87,0.35);
          background: rgba(0,16,40,0.88);
        }
        .ach-empty {
          text-align: center;
          padding: 30px 0;
          color: #e7b457;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 1), 0 0 12px rgba(0, 0, 0, 0.9);
        }

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
        @media (hover: hover) {
          .ach-card:hover { transform: translateY(-4px); }
          .ach-card:hover .ach-fill { box-shadow: 0 3px 14px rgba(231, 180, 87, 0.6); }
        }
        .ach-fill, .ach-frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 9% / 6%;
        }
        .ach-fill { z-index: 0; background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5)); transition: background 0.6s ease, box-shadow 0.25s ease; }
        .ach-frame { z-index: 0; background: url(/ui/card_objeto.webp) center / 100% 100% no-repeat; transition: filter 0.6s ease; }

        /* por obter: preto e branco (letras no cinza da moldura); obtido: acende com luz azul */
        .ach-off .ach-frame, .ach-off .ach-art img { filter: grayscale(1) brightness(0.85); }
        .ach-off .ach-name, .ach-off .ach-info { color: #a0a0a0; }
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
          font-family: inherit;
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
          font-family: inherit;
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
        @media (hover: hover) {
          .ach-own:hover img { transform: scale(1.12); }
        }
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

      <p style={{ color: "#e7b457", fontSize: "1.2rem", marginBottom: 10, textShadow: SHADOW_TEXT }}>
        {obtainedCount} / {items.length} achievements
      </p>
      <div style={{ maxWidth: 420, marginBottom: 18 }}>
        <div style={{ color: "#e7b457", fontSize: "1.1rem", marginBottom: 6, textShadow: SHADOW_TEXT }}>
          Progress {percent}%
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: "#e7b457", transition: "width 0.3s" }} />
        </div>
        <div style={{ color: "#e7b457", fontSize: "0.9rem", marginTop: 6, textShadow: SHADOW_TEXT }}>
          Your progress is saved in this browser.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <input
          type="search"
          className="ach-search"
          placeholder="Search achievements..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className={`ach-pill${open ? " on" : ""}`} onClick={() => setOpen((v) => !v)}>
          Filters
        </button>
      </div>

      {open && (
        <div className="ach-box">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`ach-pill${status === f.key ? " on" : ""}`}
                aria-pressed={status === f.key}
                onClick={() => setStatus(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="ach-field">
            <span>Sort by</span>
            <select className="ach-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="game">Game order</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label className="ach-field">
            <span>Type</span>
            <select
              className="ach-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            >
              <option value="all">All</option>
              <option value="normal">Normal</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="ach-empty">No achievements found.</div>
      ) : (
        <div className="ach-grid">
          {shown.map((a) => {
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
      )}
    </>
  );
}