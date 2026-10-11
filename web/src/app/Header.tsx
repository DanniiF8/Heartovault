"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const collectionsLinks = [
  { href: "/collections/pumpkin_carving", label: "Pumpkin Carving" },
  { href: "/collections/gardening", label: "Gardening" },
  { href: "/collections/fishing", label: "Fishing" },
  { href: "/collections/cooking", label: "Cooking" },
  { href: "/collections/birdwatching", label: "Birdwatching" },
  { href: "/collections/insect_catching", label: "Insect Catching" },
  { href: "/collections/sand_sculpture", label: "Sand Sculpture" },
  { href: "/collections/snow_sculpture", label: "Snow Sculpture" },
  { href: "/collections/ocean_cleanup", label: "Ocean Cleanup" },
  { href: "/collections/clothes", label: "Clothes" },
  { href: "/collections/furniture", label: "Furniture" },
  { href: "/collections/other", label: "Other Collections" },
];

const moreLinks = [
  { href: "/timers", label: "Timers" },
  { href: "/weather", label: "Weather Calendar" },
  { href: "/shop", label: "Ka Ching Store" },
];

function Dropdown({
  label,
  links,
}: {
  label: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          border: "none",
          color: "#e7b457",
          fontSize: "0.95rem",
          cursor: "pointer",
          padding: "6px 4px",
        }}
      >
        {label} ▾
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 200,
            background: "rgba(10, 42, 92, 0.95)",
            border: "1px solid rgba(231,180,87,0.25)",
            borderRadius: 12,
            padding: 8,
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            zIndex: 100,
          }}
        >
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "8px 12px",
                color: "#e7b457",
                textDecoration: "none",
                borderRadius: 8,
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [q, setQ] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "12px 20px",
        display: "grid",
        gridTemplateColumns: "64px 1fr auto",
        alignItems: "center",
        gap: 12,
        background: "transparent",
        borderBottom: "none",
      }}
    >
      {/* Favicon → home */}
      <a href="/" style={{ display: "flex", alignItems: "center", width: 64 }}>
        <img
          src="/favicon.png"
          alt="Heartovault"
          style={{ height: 64, width: 64, objectFit: "contain" }}
        />
      </a>

      {/* Menu centrado */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Dropdown label="Collections" links={collectionsLinks} />
        <a href="/achievements" style={linkStyle(pathname, "/achievements")}>
          Achievements
        </a>
        <a href="/map" style={linkStyle(pathname, "/map")}>
          Map
        </a>
        <Dropdown label="More" links={moreLinks} />
        <a href="/codes" style={linkStyle(pathname, "/codes")}>
          Codes
        </a>
        <a href="/profile" style={linkStyle(pathname, "/profile")}>
          Profile
        </a>
        <a href="/community" style={linkStyle(pathname, "/community")}>
          Community
        </a>
      </nav>

      {/* Search */}
      <form onSubmit={onSearch} style={{ justifySelf: "end" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          style={{
            width: 150,
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(231,180,87,0.4)",
            background: "rgba(2,20,50,0.55)",
            color: "#e7b457",
            fontSize: "0.9rem",
          }}
        />
      </form>
    </header>
  );
}

function linkStyle(pathname: string, href: string) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return {
    color: "#e7b457",
    textDecoration: "none" as const,
    fontSize: "0.95rem",
    fontWeight: active ? 700 : 500,
  };
}