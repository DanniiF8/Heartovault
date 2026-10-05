export default function HomePage() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      <section style={{ width: "100%", lineHeight: 0, background: "#021432" }}>
        <img
          src="/backgrounds/hero.jpg"
          alt="Heartovault"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </section>

      <section
        style={{
          background: "#022047",
          color: "#e7b457",
          padding: "64px 24px",
          minHeight: "80vh",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "#e7b457" }}>
          Explore
        </h2>
        <p style={{ color: "#e7b457", marginBottom: "24px", maxWidth: 520, opacity: 0.9 }}>
          Collections, achievements, animals, timers, map and more — use the menu above.
        </p>
        <p style={{ color: "#e7b457", opacity: 0.7 }}>
          More content on this page can go here later (weather, donations, links…).
        </p>
      </section>
    </main>
  );
}