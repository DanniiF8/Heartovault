import { siteConfig } from "./siteConfig";

const link = { color: "#94a3b8", textDecoration: "none" } as const;

export default function Footer() {
  return (
    <footer
      style={{
        padding: "28px 24px 36px",
        textAlign: "center",
        fontSize: "0.8rem",
        color: "#7c8aa5",
        borderTop: "1px solid rgba(231,180,87,0.15)",
        background: "rgba(2,10,28,0.9)",
      }}
    >
      <nav style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <a href="/about" style={link}>About</a>
        <a href="/privacy" style={link}>Privacy</a>
        <a href="/contact" style={link}>Contact</a>
      </nav>
      <p style={{ margin: "0 auto", maxWidth: 640, lineHeight: 1.5 }}>
        {siteConfig.name} is an unofficial fan project. Heartopia and all related names, images and game content
        belong to their respective owners.
      </p>
    </footer>
  );
}