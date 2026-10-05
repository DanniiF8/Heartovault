import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heartovault",
  description: "Discover, collect, and treasure every find in Heartopia",
  icons: {
    icon: "/favicon.png",
  },
};

const mainNav = [
  { href: "/collections", label: "Collections" },
  { href: "/achievements", label: "Achievements" },
  { href: "/animals", label: "Animals" },
  { href: "/redeem_codes", label: "Codes" },
  { href: "/timers", label: "Timers" },
  { href: "/profile", label: "Profile" },
  { href: "/map", label: "Map" },
  { href: "/community", label: "Community" },
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
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <img
  src="/logo.png"
  alt="Heartovault"
  style={{
    height: "32px",
    width: "auto",
    maxWidth: "120px",
    display: "block",
    objectFit: "contain",
  }}
/>
            <span
              style={{
                color: "#7dd3fc",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              Heartovault
            </span>
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