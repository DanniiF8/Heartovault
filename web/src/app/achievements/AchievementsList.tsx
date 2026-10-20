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

export default function AchievementsList({ items }: { items: Achievement[] }) {
  const [open, setOpen] = useState<Achievement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setOpen(a)}
            style={{
              background: "linear-gradient(160deg, #0d3270, #071a44)",
              border: "1px solid rgba(231,180,87,0.25)",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              cursor: "pointer",
              color: gold,
              font: "inherit",
            }}
          >
            {a.image ? (
              <img
                src={a.image}
                alt=""
                width={64}
                height={64}
                style={{ objectFit: "contain", display: "block", margin: "0 auto 8px" }}
              />
            ) : null}
            <span style={{ fontWeight: 700 }}>{a.name}</span>
          </button>
        ))}
      </div>

      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
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
