import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heartovault",
  description: "Discover, collect, and treasure every find in Heartopia",
};

const mainNav = [
  { href: "/Collections", label: "Collections" },
  { href: "/Achievements", label: "Achievements" },
  { href: "/Animals", label: "Animals" },
  { href: "/Redeem Codes", label: "Codes" },
  { href: "/Timers", label: "Timers" },
  { href: "/Profile", label: "Profile" },
  { href: "/Interactive Map", label: "Map" },
  { href: "/Community", label: "Community" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
            gap: "28px",
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
          <nav style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {mainNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <div style={{ padding: "24px" }}>{children}</div>
      </body>
    </html>
  );
}