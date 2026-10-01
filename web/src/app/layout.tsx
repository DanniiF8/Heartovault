import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heartovault",
  description: "A tua coleção Heartopia",
};

const categories = [
  { href: "/gardening", label: "Gardening" },
  { href: "/fishing", label: "Fishing" },
  { href: "/birds", label: "Birds" },
  { href: "/insects", label: "Insects" },
  { href: "/recipes", label: "Recipes" },
  { href: "/sculptures", label: "Sculptures" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0a1628",
          color: "#e8f4ff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #1e3a5f",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/"
            style={{
              color: "#7dd3fc",
              fontWeight: 700,
              fontSize: "1.25rem",
              textDecoration: "none",
            }}
          >
            Heartovault
          </a>
          <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {categories.map((c) => (
              <a
                key={c.href}
                href={c.href}
                style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem" }}
              >
                {c.label}
              </a>
            ))}
          </nav>
        </header>
        <div style={{ padding: "24px" }}>{children}</div>
      </body>
    </html>
  );
}