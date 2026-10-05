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
          background: "#042c77",
          color: "#e7b457",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            background: "rgba(4, 44, 119, 0.55)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(231, 180, 87, 0.25)",
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/favicon.png"
              alt="Home"
              style={{
                height: "28px",
                width: "28px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </a>
          <nav style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {mainNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: "#e7b457",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <div>{children}</div>
      </body>
    </html>
  );
}