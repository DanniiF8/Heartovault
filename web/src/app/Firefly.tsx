"use client";

import { useEffect, useRef } from "react";

type Voo = {
  speed: number;
  turn: number;
  period: number;
  delay: string;
};

function Single({ speed: speedMul, turn: turnAmt, period, delay }: Voo) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      return;
    }

    let x = window.innerWidth * (0.2 + Math.random() * 0.6);
    let y = document.documentElement.scrollHeight * (0.2 + Math.random() * 0.6);
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
        turn = (Math.random() - 0.5) * turnAmt;
        nextTurn = now + 400 + Math.random() * 900;
      }
      angle += turn * dt;

      // vai mais devagar e mais depressa, como um pirilampo
      const speed = (0.5 + Math.abs(Math.sin(now / period)) * 0.9) * speedMul;
      x += Math.cos(angle) * speed * dt;
      y += Math.sin(angle) * speed * dt;

      // perto das bordas volta para dentro do ecrã
      const w = window.innerWidth;
      const h = document.documentElement.scrollHeight;
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
  }, [turnAmt, speedMul, period]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: 150,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <div className="hv-ff">
        <div className="hv-ff-halo" style={{ animationDelay: delay }} />
        <div className="hv-ff-wing l" />
        <div className="hv-ff-wing r" />
        <div className="hv-ff-core" style={{ animationDelay: delay }} />
      </div>
    </div>
  );
}

export default function Firefly() {
  return (
    <>
      <style>{`
        .hv-ff {
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 0;
        }
        @media (max-width: 700px) {
          .hv-ff { transform: scale(0.75); }
        }
        .hv-ff-halo {
          position: absolute;
          left: -14px;
          top: -14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 235, 140, 0.5) 0%, rgba(255, 215, 100, 0.16) 40%, rgba(255, 200, 80, 0) 70%);
          animation: hvFfFlicker 3.7s ease-in-out infinite;
        }
        .hv-ff-core {
          position: absolute;
          left: -1.5px;
          top: -1.5px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #45ffe9;
          box-shadow: 0 0 4px 1px #89f2fee6;
          animation: hvFfFlicker 3.7s ease-in-out infinite;
        }
        .hv-ff-wing {
          position: absolute;
          top: -4px;
          width: 6px;
          height: 3px;
          border-radius: 50%;
          background: #ffc65380;
          animation: hvFfFlap 0.12s ease-in-out infinite alternate;
        }
        .hv-ff-wing.l { left: -6px; transform-origin: right center; --r: 25deg; }
        .hv-ff-wing.r { left: 0; transform-origin: left center; --r: -25deg; }
        @keyframes hvFfFlap {
          from { transform: rotate(calc(var(--r) * 0.2)) scaleY(0.5); }
          to { transform: rotate(var(--r)) scaleY(1); }
        }
        @keyframes hvFfFlicker {
          0%, 100% { opacity: 0.3; }
          20% { opacity: 1; }
          35% { opacity: 0.45; }
          55% { opacity: 1; }
          75% { opacity: 0.25; }
        }
      `}</style>
      <Single speed={1} turn={0.06} period={1500} delay="0s" />
      <Single speed={0.7} turn={0.1} period={2200} delay="-1.3s" />
      <Single speed={1.3} turn={0.035} period={1100} delay="-2.4s" />
    </>
  );
}