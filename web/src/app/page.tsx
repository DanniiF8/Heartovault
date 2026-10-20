"use client";

import { useEffect, useState } from "react";
import { Birthstone } from "next/font/google";

const birthstone = Birthstone({ weight: "400", subsets: ["latin"], display: "swap" });

// cor para onde a imagem "desvanece" em baixo (azul-marinho escuro)
const BG = "#0a1431";
const BG_TRANSPARENT = "rgba(10, 20, 49, 0)";
const GOLD = "#e7b457";

// brilho dourado + sombra escura para a letra se ler bem por cima da imagem
const GLOW = "0 0 12px rgba(231,180,87,0.45), 0 2px 6px rgba(0,0,0,0.9)";

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
  // começa vazio e só escolhe depois de a página abrir (evita erros de hidratação)
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(pickHero());
  }, []);

  return (
    <main style={{ background: BG, minHeight: "100vh" }}>
      <div style={{ position: "relative" }}>
        {src ? (
          <img
            src={src}
            alt=""
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: "3 / 2", background: BG }} />
        )}

        {/* texto e logo por cima da imagem */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "6% 5% 0",
            fontFamily: birthstone.style.fontFamily,
            color: GOLD,
            textShadow: GLOW,
          }}
        >
          <div style={{ fontSize: "clamp(1.4rem, 5vw, 3.2rem)", lineHeight: 1 }}>
            Welcome to
          </div>
          <h1 style={{ margin: "1% 0", lineHeight: 0 }}>
            <img
              src="/logo.webp"
              alt="Heartovault"
              style={{
                width: "clamp(180px, 52vw, 560px)",
                height: "auto",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
              }}
            />
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: "90%",
              fontSize: "clamp(1.2rem, 4.4vw, 2.8rem)",
              lineHeight: 1.15,
            }}
          >
            Unlock the magic of Heartopia.
            <br />
            Discover, collect, and treasure every find
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
          }}
        />
      </div>
    </main>
  );
}