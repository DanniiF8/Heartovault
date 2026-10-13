// cor para onde a imagem "desvanece" em baixo (azul-marinho escuro)
const BG = "#0a1431";
const BG_TRANSPARENT = "rgba(10, 20, 49, 0)";

export default function HomePage() {
  return (
    <main style={{ background: BG, minHeight: "100vh" }}>
      <div style={{ position: "relative" }}>
        {/* a imagem aparece sempre completa, e a página desliza para baixo */}
        <img
          src="/hero.png"
          alt="Heartovault"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        {/* desvanecimento suave no fundo da imagem (esconde também a linha branca da borda) */}
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
