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
        position: "relative",
        zIndex: 5,
        marginTop: -120,
        padding: "90px 24px 32px",
        textAlign: "center",
        fontSize: "1rem",
        color: "#e7b457",
        background: "linear-gradient(to bottom, rgba(5,10,25,0), rgba(5,10,25,0.75))",
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
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