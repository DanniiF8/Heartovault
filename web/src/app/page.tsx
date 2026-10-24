"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Birthstone } from "next/font/google";

const birthstone = Birthstone({ weight: "400", subsets: ["latin"], display: "swap" });

// cor para onde a imagem "desvanece" em baixo (azul-marinho escuro)
const BG = "#0a1431";
const BG_TRANSPARENT = "rgba(10, 20, 49, 0)";
const GOLD = "#f0c46a";

// sombra fina e suave para a letra se ler bem por cima da imagem
const GLOW =
  "0 0 8px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.7), 0 0 14px rgba(231,180,87,0.25)";

// quanto tempo dura a transição entre duas imagens (em milissegundos)
const FADE_MS = 2500;

// escolhe a imagem pela data (estação) e pela hora (dia ou noite) de quem visita
function pickHero(): string {
  const now = new Date();
  const month = now.getMonth(); // 0 = janeiro ... 11 = dezembro
  const hour = now.getHours();

  let season = "inverno";
  if (month >= 2 && month <= 4) season = "primavera";
  else if (month >= 5 && month <= 7) season = "verao";
  else if (month >= 8 && month <= 10) season = "outono";

  const period = hour >= 7 && hour < 19 ? "dia" : "noite";
  return `/hero/${season}_${period}.webp`;
}

export default function HomePage() {
  // src = imagem que se vê agora; prev = a anterior, que fica por baixo enquanto desvanece
  const [src, setSrc] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);
  const atual = useRef<string | null>(null);
  const limpar = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // troca para a imagem nova, com fade (carrega-a primeiro para não piscar)
  const trocar = useCallback((proxima: string) => {
    if (proxima === atual.current) return;
    const img = new Image();
    img.onload = () => {
      const anterior = atual.current;
      atual.current = proxima;
      setPrev(anterior);
      setSrc(proxima);
      if (limpar.current) clearTimeout(limpar.current);
      limpar.current = setTimeout(() => setPrev(null), FADE_MS + 200);
    };
    img.src = proxima;
  }, []);

  useEffect(() => {
    function verificar() {
      trocar(pickHero());
    }

    verificar();
    const id = setInterval(verificar, 60000); // volta a ver de minuto a minuto
    const aoVoltar = () => {
      if (document.visibilityState === "visible") verificar();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      clearInterval(id);
      if (limpar.current) clearTimeout(limpar.current);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [trocar]);

  return (
    <main className="hv-home" style={{ background: BG, minHeight: "100vh" }}>
      <style>{`
        @keyframes hvFade { from { opacity: 0; } to { opacity: 1; } }
        .hv-fade { animation: hvFade ${FADE_MS}ms ease-in-out both; }
        @media (prefers-reduced-motion: reduce) { .hv-fade { animation: none; } }
        @media (max-width: 700px) { main.hv-home { padding-top: 0 !important; } }
      `}</style>

      <div style={{ position: "relative" }}>
        {src ? (
          <img
            key={src}
            className="hv-fade"
            src={src}
            alt=""
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              minHeight: "100vh",
              objectFit: "cover",
              position: "relative",
              zIndex: 1,
            }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: "3 / 2", minHeight: "100vh", background: BG }} />
        )}

        {/* a imagem anterior fica por baixo enquanto a nova aparece */}
        {prev && (
          <img
            src={prev}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
        )}

        {/* texto e logo no canto de cima à esquerda, por cima da imagem */}
        <div
          style={{
            position: "absolute",
            top: "max(9%, 110px)",
            left: "5%",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: birthstone.style.fontFamily,
            color: GOLD,
            textShadow: GLOW,
            fontSize: "clamp(0.95rem, 2.8vw, 3.6rem)",
            lineHeight: 1.15,
          }}
        >
          <div>Welcome to</div>
          <h1 style={{ margin: "0.2em 0 0.3em" }}>
            <img
              src="/logo.webp"
              alt="Heartovault"
              style={{
                display: "block",
                width: "clamp(120px, 19vw, 420px)",
                height: "auto",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
              }}
            />
          </h1>
          <p style={{ margin: 0, whiteSpace: "nowrap" }}>
            Unlock the magic of Heartopia.
            <br />
            Discover, collect, and
            <br />
            treasure every find
          </p>
        </div>

        {/* desvanecimento suave no fundo da imagem */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "30%",
            background: `linear-gradient(to bottom, ${BG_TRANSPARENT}, ${BG})`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      </div>
    </main>
  );
}