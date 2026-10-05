"use client";

import { usePathname } from "next/navigation";

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

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
        background: "rgba(2, 20, 50, 0.25)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(231, 180, 87, 0.15)",
      }}
    >
      {!isHome && (
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/favicon.png"
            alt="Home"
            style={{
              height: "40px",
              width: "40px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </a>
      )}
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
  );
}