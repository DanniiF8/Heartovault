export default function HomePage() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      {/* Imagem a ocupar o ecrã: logo + frase já estão na imagem */}
      <section
        style={{
          minHeight: "100vh",
          backgroundImage: "url(/backgrounds/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Ao descer: resto da home "colado" em baixo */}
      <section
        style={{
          background: "#153566",
          padding: "48px 24px",
          minHeight: "50vh",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>Explore</h2>
        <p style={{ color: "#94a3b8", marginBottom: "24px", maxWidth: 520 }}>
          Collections, achievements, animals, timers, map and more — use the menu above.
        </p>
        <p style={{ color: "#687990" }}>
          More content on this page can go here later (weather, donations, links…).
        </p>
      </section>
    </main>
  );
}