"use client";

import { useEffect, useState } from "react";

// cor para onde a imagem "desvanece" em baixo (azul-marinho escuro)
const BG = "#0a1431";
const BG_TRANSPARENT = "rgba(10, 20, 49, 0)";

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
            alt="Heartovault"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: "3 / 2", background: BG }} />
        )}
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