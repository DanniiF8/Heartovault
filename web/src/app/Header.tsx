"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { collectionsLinks } from "./collectionsLinks";
import { moreLinks, shopsLinks } from "./menuLinks";

function Dropdown({
  label,
  links,
  href,
}: {
  label: string;
  links: { href: string; label: string }[];
  href?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {href ? (
        <span style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
          <a
            href={href}
            style={{
              color: "#e7b457",
              textDecoration: "none",
              fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
              padding: "4px 2px",
            }}
          >
            {label}
          </a>
          <button
            type="button"
            aria-label={`${label} menu`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              color: "#e7b457",
              fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
              cursor: "pointer",
              padding: "4px 4px",
            }}
          >
            ▾
          </button>
        </span>
      ) : (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          border: "none",
          color: "#e7b457",
          fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
          cursor: "pointer",
          padding: "4px 2px",
          whiteSpace: "nowrap",
        }}
      >
        {label} ▾
      </button>
      )}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 200,
            maxHeight: "70vh",
            overflowY: "auto",
            background: "rgba(10, 42, 92, 0.98)",
            border: "1px solid rgba(231,180,87,0.25)",
            borderRadius: 12,
            padding: 8,
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
            zIndex: 9999,
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
                fontSize: "0.85rem",
                textAlign: "center",
                whiteSpace: "nowrap",
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

  const navLink = (href: string, label: string) => (
    <a
      href={href}
      style={{
        color: "#e7b457",
        textDecoration: "none",
        fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
        fontWeight:
          pathname === href || pathname.startsWith(href + "/") ? 700 : 500,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </a>
  );

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: isHome
          ? "transparent"
          : "linear-gradient(to bottom, rgba(2,12,36,0.92) 0%, rgba(2,12,36,0.75) 55%, rgba(2,12,36,0) 100%)",
        minHeight: 56,
        overflow: "visible",
      }}
    >
      {!isHome ? (
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            marginRight: 24,
          }}
        >
          <img
            src="/favicon.png"
            alt="Heartovault"
            style={{
              height: 88,
              width: 88,
              minWidth: 88,
              minHeight: 88,
              objectFit: "contain",
            }}
          />
        </a>
      ) : (
        <div style={{ width: 8, flexShrink: 0 }} />
      )}

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(6px, 1.2vw, 14px)",
          flex: 1,
          flexWrap: "nowrap",
          minWidth: 0,
          overflow: "visible",
        }}
      >
        <Dropdown label="Collections" links={collectionsLinks} href="/collections" />
        {navLink("/achievements", "Achievements")}
        <Dropdown label="Shops" links={shopsLinks} href="/shops" />
        <Dropdown label="More" links={moreLinks} href="/more" />
        {navLink("/codes", "Codes")}
        {navLink("/profile", "Profile")}
        {navLink("/community", "Community")}
      </nav>

      <form onSubmit={onSearch} style={{ flexShrink: 0 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          style={{
            width: "clamp(90px, 12vw, 150px)",
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(231,180,87,0.4)",
            background: "rgba(2,20,50,0.55)",
            color: "#e7b457",
            fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
          }}
        />
      </form>
    </header>
  );
}