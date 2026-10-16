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
      <h1 style={{ fontSize: "1.75rem", marginBottom: 24, color: "#e7b457" }}>Collections</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        {collectionsLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              background: "linear-gradient(160deg, #0d3270, #071a44)",
              border: "1px solid rgba(231,180,87,0.25)",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              textDecoration: "none",
              color: "#e7b457",
              fontWeight: 600,
            }}
          >
            {item.icon ? (
              <img
                src={item.icon}
                alt=""
                width={80}
                height={80}
                style={{ display: "block", margin: "0 auto 10px", objectFit: "contain" }}
              />
            ) : null}
            {item.label}
          </a>
        ))}
      </div>
    </main>
  );
}
