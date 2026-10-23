"use client";

import { useEffect, useRef, useState } from "react";

export type Achievement = {
  id: number;
  name: string;
  objective: string;
  title: string;
  image: string | null;
};

const gold = "#e7b457";
const muted = "#94a3b8";
const TIP_W = 280;

// balão que aparece ao passar o rato (só em ecrãs com rato)
type Tip = { a: Achievement; left: number; top?: number; bottom?: number };

export default function AchievementsList({ items }: { items: Achievement[] }) {
  const [open, setOpen] = useState<Achievement | null>(null); // pop-up (telemóvel / toque)
  const [tip, setTip] = useState<Tip | null>(null); // balão (rato)
  const [canHover, setCanHover] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    const esconder = () => setTip(null);
    window.addEventListener("scroll", esconder, true);
    return () => window.removeEventListener("scroll", esconder, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function mostrar(el: HTMLElement, a: Achievement) {
    if (!canHover) return;
    const r = el.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left + r.width / 2 - TIP_W / 2), window.innerWidth - TIP_W - 8);
    // por baixo do cartão; se não couber, por cima
    if (r.bottom + 200 > window.innerHeight) {
      setTip({ a, left, bottom: window.innerHeight - r.top + 8 });
    } else {
      setTip({ a, left, top: r.bottom + 8 });
    }
  }

  return (
    <>
      <style>{`
        .ach-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 14px;
        }
        /* cartão = a moldura card_menu por cima de um fundo azul */
        .ach-card {
          aspect-ratio: 5 / 8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6%;
          padding: 14% 18% 23%;
          box-sizing: border-box;
          text-align: center;
          cursor: pointer;
          color: ${gold};
          font: inherit;
          font-weight: 600;
          border: none;
          border-radius: 9%/6%;
          background:
            url(/ui/card_menu.webp) center / 100% 100% no-repeat,
            linear-gradient(160deg, #0d3270, #071a44);
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .ach-card:hover, .ach-card:focus-visible {
          transform: translateY(-4px);
          filter: drop-shadow(0 6px 14px rgba(231,180,87,0.35));
          outline: none;
        }
        .ach-card img {
          display: block;
          width: 74%;
          height: auto;
          aspect-ratio: 1 / 1;
          object-fit: contain;
        }
                .ach-name {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: clamp(0.85rem, 1.2vw, 1.05rem);0.9rem);
          line-height: 1.15;
        }
      `}</style>

      <div className="ach-grid">
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            className="ach-card"
            onClick={() => {
              if (!canHover) setOpen(a); // no telemóvel abre ao tocar
            }}
            onMouseEnter={(e) => mostrar(e.currentTarget, a)}
            onMouseLeave={() => setTip(null)}
            onFocus={(e) => mostrar(e.currentTarget, a)}
            onBlur={() => setTip(null)}
          >
            {a.image ? <img src={a.image} alt="" /> : null}
            <span className="ach-name">{a.name}</span>
          </button>
        ))}
      </div>

      {/* balão ao passar o rato */}
      {tip && (
        <div
          role="tooltip"
          style={{
            position: "fixed",
            left: tip.left,
            top: tip.top,
            bottom: tip.bottom,
            width: TIP_W,
            zIndex: 200,
            pointerEvents: "none",
            background: "linear-gradient(160deg, #0d3270, #071a44)",
            border: "1px solid rgba(231,180,87,0.6)",
            borderRadius: 14,
            padding: 16,
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(231,180,87,0.2)",
          }}
        >
          <div style={{ color: gold, fontWeight: 700, fontSize: "1.05rem", marginBottom: 10 }}>{tip.a.name}</div>
          {tip.a.objective && (
            <>
              <div style={{ color: muted, fontSize: "0.75rem", marginBottom: 2 }}>Mission</div>
              <p style={{ color: "#e8f4ff", lineHeight: 1.45, margin: "0 0 10px", fontSize: "0.9rem" }}>{tip.a.objective}</p>
            </>
          )}
          {tip.a.title && (
            <>
              <div style={{ color: muted, fontSize: "0.75rem", marginBottom: 2 }}>Title reward</div>
              <p style={{ color: "#d4af37", fontWeight: 700, margin: 0, fontSize: "0.9rem" }}>{tip.a.title}</p>
            </>
          )}
        </div>
      )}

      {/* pop-up ao tocar (telemóvel) */}
      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(2,8,24,0.78)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={open.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(440px, 100%)",
              background: "linear-gradient(160deg, #0d3270, #071a44)",
              border: "1px solid rgba(231,180,87,0.6)",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              boxShadow: "0 0 30px rgba(231,180,87,0.25)",
            }}
          >
            {open.image ? (
              <img
                src={open.image}
                alt=""
                width={96}
                height={96}
                style={{ objectFit: "contain", display: "block", margin: "0 auto 10px" }}
              />
            ) : null}
            <h2 style={{ margin: "0 0 14px", color: gold, fontSize: "1.3rem" }}>{open.name}</h2>
            {open.objective && (
              <>
                <div style={{ color: muted, fontSize: "0.8rem", marginBottom: 4 }}>Mission</div>
                <p style={{ color: "#e8f4ff", lineHeight: 1.5, margin: "0 0 14px" }}>{open.objective}</p>
              </>
            )}
            {open.title && (
              <>
                <div style={{ color: muted, fontSize: "0.8rem", marginBottom: 4 }}>Title reward</div>
                <p style={{ color: "#f3d98b", fontWeight: 700, margin: "0 0 18px" }}>{open.title}</p>
              </>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(null)}
              style={{
                border: "1px solid rgba(231,180,87,0.6)",
                background: gold,
                color: "#021432",
                borderRadius: 999,
                padding: "8px 24px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}