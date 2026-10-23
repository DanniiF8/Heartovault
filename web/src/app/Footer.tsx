import { siteConfig } from "./siteConfig";

const link = {
  color: "#e7b457",
  textDecoration: "none",
  fontWeight: 600,
} as const;

export default function Footer() {
  return (
    <footer
      style={{
        padding: "28px 24px 36px",
        textAlign: "center",
        fontSize: "1rem",
        color: "#e7b457",
        background: "linear-gradient(to bottom, #0a1431, rgba(6, 14, 36, 0.92))",
        textShadow: "0 1px 4px rgba(0,0,0,0.7)",
      }}
    >
      <nav style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
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