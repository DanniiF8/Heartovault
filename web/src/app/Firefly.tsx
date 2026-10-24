"use client";

import { useEffect, useRef } from "react";

export default function Firefly() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      return;
    }

    let x = window.innerWidth * (0.2 + Math.random() * 0.6);
    let y = window.innerHeight * (0.2 + Math.random() * 0.6);
    let angle = Math.random() * Math.PI * 2;
    let turn = 0;
    let nextTurn = 0;
    let last = performance.now();
    let raf = 0;

    el.style.transform = `translate(${x}px, ${y}px)`;

    const loop = (now: number) => {
      const dt = Math.max(0, Math.min((now - last) / 16.67, 3));
      last = now;

      // de vez em quando muda de curva
      if (now > nextTurn) {
        turn = (Math.random() - 0.5) * 0.06;
        nextTurn = now + 400 + Math.random() * 900;
      }
      angle += turn * dt;

      // vai mais devagar e mais depressa, como um pirilampo
      const speed = 0.5 + Math.abs(Math.sin(now / 1500)) * 0.9;
      x += Math.cos(angle) * speed * dt;
      y += Math.sin(angle) * speed * dt;

      // perto das bordas volta para dentro do ecrã
      const w = window.innerWidth;
      const h = window.innerHeight;
      const m = 40;
      if (x < m || x > w - m || y < m || y > h - m) {
        let diff = Math.atan2(h / 2 - y, w / 2 - x) - angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        angle += diff * 0.08 * dt;
      }

      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: 150,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <style>{`
        .hv-firefly {
          position: absolute;
          left: -4px;
          top: -4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, #fffbe0 0%, #ffe98a 45%, rgba(255, 233, 138, 0) 75%);
          box-shadow: 0 0 8px 3px rgba(255, 226, 120, 0.8), 0 0 22px 8px rgba(255, 200, 80, 0.35);
          animation: hvFireflyPulse 2.6s ease-in-out infinite;
        }
        @keyframes hvFireflyPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
      <div className="hv-firefly" />
    </div>
  );
}