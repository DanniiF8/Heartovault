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
const TIP_W = 280;

// caixa: azul dos cartões + uma linha dourada brilhante (igual às caixas dos detalhes)
const boxStyle = {
  background: "linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5))",
  border: "1px solid #f0c46a",
  borderRadius: 14,
  boxShadow: "0 0 6px rgba(240, 196, 106, 0.7), inset 0 0 5px rgba(240, 196, 106, 0.35)",
} as const;

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
          grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
          gap: 20px;
        }
        /* cartão igual ao do insect_catching: azul + moldura card_objeto */
        .ach-card {
          position: relative;
          isolation: isolate;
          container-type: inline-size;
          aspect-ratio: 2 / 3;
          display: block;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          color: ${gold};
          font: inherit;
          transition: transform 0.25s ease;
        }
        .ach-card:hover, .ach-card:focus-visible { transform: translateY(-3px); outline: none; }
        .ach-fill, .ach-frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 9% / 6%;
        }
        .ach-fill { z-index: 0; background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5)); }
        .ach-frame { z-index: 0; background: url(/ui/card_objeto.webp) center / 100% 100% no-repeat; }
        .ach-card:hover .ach-frame, .ach-card:focus-visible .ach-frame { filter: drop-shadow(0 0 6px rgba(240, 196, 106, 0.7)); }
        .ach-art {
          position: absolute;
          z-index: 1;
          left: 10%;
          right: 10%;
          top: 9%;
          height: 52%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ach-art img { display: block; max-width: 88%; max-height: 92%; object-fit: contain; }
        .ach-name {
          position: absolute;
          z-index: 1;
          left: 10%;
          right: 10%;
          top: 63%;
          height: 24%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: 'EB Garamond', Georgia, serif;
          font-weight: 700;
          font-size: 8cqw;
          line-height: 1.1;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.7);
        }
        /* telemóvel: 2 cartões por fila */
        @media (max-width: 560px) {
          .ach-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
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
            <span className="ach-fill" />
            <span className="ach-frame" />
            <span className="ach-art">{a.image ? <img src={a.image} alt="" /> : null}</span>
            <span className="ach-name">{a.name}</span>
          </button>
        ))}
      </div>

      {/* balão ao passar o rato */}
      {tip && (
        <div
          role="tooltip"
          style={{
            ...boxStyle,
            position: "fixed",
            left: tip.left,
            top: tip.top,
            bottom: tip.bottom,
            width: TIP_W,
            zIndex: 200,
            pointerEvents: "none",
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ color: gold, fontWeight: 700, fontSize: "1.05rem", marginBottom: 10 }}>{tip.a.name}</div>
          {tip.a.objective && (
            <>
              <div style={{ color: gold, opacity: 0.8, fontSize: "0.75rem", marginBottom: 2 }}>Mission</div>
              <p style={{ color: gold, lineHeight: 1.45, margin: "0 0 10px", fontSize: "0.9rem" }}>{tip.a.objective}</p>
            </>
          )}
          {tip.a.title && (
            <>
              <div style={{ color: gold, opacity: 0.8, fontSize: "0.75rem", marginBottom: 2 }}>Title reward</div>
              <p style={{ color: gold, fontWeight: 700, margin: 0, fontSize: "0.9rem" }}>{tip.a.title}</p>
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
            background: "rgba(2,8,24,0.6)",
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
              ...boxStyle,
              width: "min(440px, 100%)",
              padding: 24,
              textAlign: "center",
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
                <div style={{ color: gold, opacity: 0.8, fontSize: "0.8rem", marginBottom: 4 }}>Mission</div>
                <p style={{ color: gold, lineHeight: 1.5, margin: "0 0 14px" }}>{open.objective}</p>
              </>
            )}
            {open.title && (
              <>
                <div style={{ color: gold, opacity: 0.8, fontSize: "0.8rem", marginBottom: 4 }}>Title reward</div>
                <p style={{ color: gold, fontWeight: 700, margin: "0 0 18px" }}>{open.title}</p>
              </>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(null)}
              style={{
                border: "1px solid #f0c46a",
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