import { collectionsLinks } from "../collectionsLinks";

export default function CollectionsPage() {
  return (
    <main
      style={{
        padding: "110px 24px 24px",
        minHeight: "100vh",
        // fundo opcional: se existir /public/backgrounds/collections.webp aparece com uma camada escura por cima
        background:
          "linear-gradient(rgba(2,12,36,0.78), rgba(2,12,36,0.92)), url(/backgrounds/collections.webp) center / cover fixed, #06122e",
      }}
    >
      <style>{`
        .hub-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 1000px;
        }
        @media (min-width: 720px) {
          .hub-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .hub-card img {
          display: block;
          width: 100%;
          max-width: 150px;
          height: auto;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          margin: 0 auto 12px;
        }
      `}</style>

      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>Collections</h1>
      <div className="hub-grid">
        {collectionsLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="hub-card"
            style={{
              background: "linear-gradient(160deg, #0d3270, #071a44)",
              border: "1px solid rgba(231,180,87,0.25)",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              textDecoration: "none",
              color: "#e7b457",
              fontWeight: 600,
            }}
          >
            {item.icon ? <img src={item.icon} alt="" /> : null}
            {item.label}
          </a>
        ))}
      </div>
    </main>
  );
}
