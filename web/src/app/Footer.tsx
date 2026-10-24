"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "./siteConfig";

const link = {
  color: "#e7b457",
  textDecoration: "none",
  fontWeight: 600,
} as const;

export default function Footer() {
  const isHome = usePathname() === "/";

  return (
    <footer
      className={isHome ? "hv-home-ftr" : undefined}
      style={{
        position: "relative",
        zIndex: 5,
        marginTop: isHome ? 0 : -120,
        padding: isHome ? "32px 24px 32px" : "90px 24px 32px",
        textAlign: "center",
        fontSize: "1rem",
        color: "#e7b457",
        background: isHome
          ? "#0a1431"
          : "linear-gradient(to bottom, rgba(5,10,25,0), rgba(5,10,25,0.75))",
        borderTop: isHome ? "1px solid #f0c46a" : "none",
        boxShadow: isHome ? "0 -4px 6px -3px rgba(240, 196, 106, 0.6)" : "none",
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
      }}
    >
      {isHome && (
        <img className="hv-detail hv-detail-bottom" src="/ui/detail_2.png" alt="" aria-hidden="true" />
      )}
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