"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Birthstone } from "next/font/google";

const birthstone = Birthstone({ weight: "400", subsets: ["latin"], display: "swap" });

// cor para onde a imagem "desvanece" em baixo (azul-marinho escuro)
const BG = "#0a1431";
const BG_TRANSPARENT = "rgba(10, 20, 49, 0)";
const GOLD = "#f0c46a";

// brilho dourado + sombra escura para a letra se ler bem por cima da imagem
const GLOW = "0 0 12px rgba(231,180,87,0.45), 0 2px 6px rgba(0,0,0,0.9)";

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

// TESTE (apagar depois): as 8 imagens para experimentares a transição
const TESTE: { nome: string; ficheiro: string }[] = [
  { nome: "Primavera ☀", ficheiro: "primavera_dia" },
  { nome: "Primavera ☾", ficheiro: "primavera_noite" },
  { nome: "Verão ☀", ficheiro: "verao_dia" },
  { nome: "Verão ☾", ficheiro: "verao_noite" },
  { nome: "Outono ☀", ficheiro: "outono_dia" },
  { nome: "Outono ☾", ficheiro: "outono_noite" },
  { nome: "Inverno ☀", ficheiro: "inverno_dia" },
  { nome: "Inverno ☾", ficheiro: "inverno_noite" },
];

export default function HomePage() {
  // src = imagem que se vê agora; prev = a anterior, que fica por baixo enquanto desvanece
  const [src, setSrc] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);
  const atual = useRef<string | null>(null);
  const limpar = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const manual = useRef(false); // TESTE: enquanto estiver ligado, a troca automática pausa

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
      if (manual.current) return;
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
    <main style={{ background: BG, minHeight: "100vh" }}>
      <style>{`
        @keyframes hvFade { from { opacity: 0; } to { opacity: 1; } }
        .hv-fade { animation: hvFade ${FADE_MS}ms ease-in-out both; }
        @media (prefers-reduced-motion: reduce) { .hv-fade { animation: none; } }
      `}</style>

      <div style={{ position: "relative" }}>
        {src ? (
          <img
            key={src}
            className="hv-fade"
            src={src}
            alt=""
            style={{ display: "block", width: "100%", height: "auto", position: "relative", zIndex: 1 }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: "3 / 2", background: BG }} />
        )}

        {/* a imagem anterior fica por baixo enquanto a nova aparece */}
        {prev && (
          <img
            src={prev}
            alt=""
            aria-hidden="true"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", zIndex: 0 }}
          />
        )}

        {/* texto e logo no canto de cima à esquerda, por cima da imagem */}
        <div
          style={{
            position: "absolute",
            top: "9%",
            left: "5%",
            zIndex: 2,
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

      {/* TESTE (apagar depois): botões para ver a transição entre as 8 imagens */}
      <div
        style={{
          position: "fixed",
          left: 12,
          bottom: 12,
          zIndex: 50,
          background: "rgba(6,18,46,0.88)",
          border: "1px solid rgba(231,180,87,0.5)",
          borderRadius: 10,
          padding: 8,
          display: "grid",
          gridTemplateColumns: "repeat(2, auto)",
          gap: 6,
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
        }}
      >
        {TESTE.map((t) => (
          <button
            key={t.ficheiro}
            onClick={() => {
              manual.current = true;
              trocar(`/hero/${t.ficheiro}.webp`);
            }}
            style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 6, border: "1px solid #e7b457", background: "#0a1431", color: "#f0c46a" }}
          >
            {t.nome}
          </button>
        ))}
        <button
          onClick={() => {
            manual.current = false;
            trocar(pickHero());
          }}
          style={{ gridColumn: "1 / span 2", cursor: "pointer", padding: "4px 8px", borderRadius: 6, border: "1px solid #e7b457", background: "#e7b457", color: "#0a1431", fontWeight: 600 }}
        >
          Voltar ao automático
        </button>
      </div>
    </main>
  );
}