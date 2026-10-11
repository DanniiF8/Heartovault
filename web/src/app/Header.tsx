"use client";

import { usePathname } from "next/navigation";

const mainNav = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/collections", label: "Collection" },
  { href: "/friends", label: "Friends" },
  { href: "/profile", label: "Profile" },
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
        justifyContent: "center",
        gap: "24px",
        flexWrap: "wrap",
        background: "rgba(2, 20, 50, 0.35)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(231, 180, 87, 0.15)",
      }}
    >
      {!isHome && (
        <a
          href="/"
          style={{
            position: "absolute",
            left: 24,
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/favicon.png"
            alt="Home"
            style={{
              height: 40,
              width: 40,
              objectFit: "contain",
              display: "block",
            }}
          />
        </a>
      )}

      <nav style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {mainNav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              color: "#e7b457",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: pathname === item.href ? 700 : 500,
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}