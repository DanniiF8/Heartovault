"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Birthstone } from "next/font/google";
import { collectionsLinks } from "./collectionsLinks";
import { moreLinks, shopsLinks } from "./menuLinks";

const birthstone = Birthstone({ weight: "400", subsets: ["latin"], display: "swap" });

const GOLD = "#e7b457";
const FONT = "clamp(0.7rem, 1.4vw, 0.95rem)";

// título que aparece à direita no cabeçalho, em cada página
const TITULOS: Record<string, string> = {
  collections: "Collections",
  achievements: "Achievements",
  shops: "Shops",
  shop: "Ka-Ching Store",
  more: "More",
  codes: "Redeem Codes",
  profile: "Profile",
  community: "Community",
  map: "Map",
  timers: "Timers",
  weather: "Weather",
  search: "Search",
  animals: "Animals",
  friends: "Friends",
  about: "About",
  privacy: "Privacy",
  contact: "Contact",
};

function tituloDaPagina(pathname: string): string | null {
  const partes = pathname.split("/").filter(Boolean);
  const topo = partes[0];
  if (!topo || !(topo in TITULOS)) return null;
  // dentro de uma coleção mostra o nome dela (Fishing, Gardening...)
  if (topo === "collections" && partes[1]) {
    const c = collectionsLinks.find((l) => l.href === `/collections/${partes[1]}`);
    if (c) return c.label;
  }
  return TITULOS[topo];
}

function Icone({ src, size = 30 }: { src?: string; size?: number }) {
  if (!src) return null;
  return (
    <img
      className="hv-nav-icon"
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: "contain", flexShrink: 0 }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

function Dropdown({
  label,
  links,
  href,
  icon,
}: {
  label: string;
  links: { href: string; label: string; icon?: string }[];
  href?: string;
  icon?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="hv-dd-wrap"
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {href ? (
        <span style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
          <a
            href={href}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: GOLD,
              textDecoration: "none",
              fontSize: FONT,
              padding: "0 2px",
            }}
          >
            <Icone src={icon} />
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
              color: GOLD,
              fontSize: FONT,
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
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "transparent",
            border: "none",
            color: GOLD,
            fontSize: FONT,
            cursor: "pointer",
            padding: "0 2px",
            whiteSpace: "nowrap",
          }}
        >
          <Icone src={icon} />
          {label} ▾
        </button>
      )}
      {open && (
        <div
          className="hv-dd-menu"
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "8px 12px",
                color: GOLD,
                textDecoration: "none",
                borderRadius: 8,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
              }}
            >
              <Icone src={item.icon} size={24} />
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
  const titulo = tituloDaPagina(pathname);
  const [q, setQ] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const navLink = (href: string, label: string, icon: string) => (
    <a
      href={href}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        color: GOLD,
        textDecoration: "none",
        fontSize: FONT,
        fontWeight: 700,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Icone src={icon} />
      {label}
    </a>
  );

  return (
    <header
      className="hv-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "2px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(10, 38, 74, 0.5)",
        overflow: "visible",
      }}
    >
      <style>{`
        .hv-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(8px, 1.4vw, 18px);
          padding: 0 24px;
        }
        .hv-pill a, .hv-pill button {
          font-weight: 700;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
        }
        /* caixa de pesquisa com a moldura search.webp */
        .hv-search {
          position: relative;
          flex-shrink: 0;
          width: clamp(130px, 13vw, 190px);
          aspect-ratio: 3 / 1;
          display: flex;
          align-items: center;
        }
        .hv-search::before {
          content: "";
          position: absolute;
          inset: 20% 9%;
          border-radius: 999px;
          background: rgba(2, 20, 50, 0.72);
        }
        .hv-search::after {
          content: "";
          position: absolute;
          inset: 0;
          background: url(/icons/menu/search.webp) center / 100% 100% no-repeat;
          pointer-events: none;
        }
        .hv-search input {
          position: relative;
          z-index: 1;
          width: 100%;
          padding: 0 15%;
          background: transparent;
          border: none;
          outline: none;
          color: #f0c46a;
          font-size: clamp(0.72rem, 1.1vw, 0.9rem);
        }
        .hv-search input::placeholder { color: rgba(231, 180, 87, 0.7); }
        .hv-title {
          flex-shrink: 0;
          white-space: nowrap;
          color: #f0c46a;
          font-size: clamp(1.8rem, 2.8vw, 2.6rem);
          line-height: 1;
          text-shadow: 0 0 10px rgba(231, 180, 87, 0.4), 0 2px 6px rgba(0, 0, 0, 0.9);
        }
        .hv-row { display: contents; }

        /* janela média: menu em 2 linhas */
        @media (max-width: 1000px) {
          .hv-pill { flex-direction: column; gap: 4px; padding: 0 8px; }
          .hv-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: clamp(8px, 1.4vw, 18px);
          }
          .hv-nav-icon { width: 22px; height: 22px; }
        }

        /* telemóvel: logo + título + pesquisa em cima, menu por baixo */
        @media (max-width: 700px) {
          .hv-header {
            flex-wrap: wrap;
            position: sticky !important;
            gap: 4px 8px !important;
            padding: 2px 8px !important;
          }
          .hv-logo { height: 52px !important; width: 52px !important; min-width: 52px !important; min-height: 52px !important; }
          .hv-title { font-size: 1.5rem; }
          .hv-search { width: 140px; margin-left: auto; }
          .hv-nav { order: 3; flex: 1 1 100% !important; }
          .hv-pill { width: 100%; padding: 0; gap: 2px; }
          .hv-row { width: 100%; justify-content: space-around; gap: 2px; }
          .hv-pill a, .hv-pill button { font-size: 0.68rem !important; }
          .hv-nav-icon { width: 20px; height: 20px; }
          /* dropdowns à largura do ecrã */
          .hv-dd-wrap { position: static !important; }
          .hv-dd-menu {
            position: absolute !important;
            top: 100% !important;
            left: 8px !important;
            right: 8px !important;
            transform: none !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      {!isHome ? (
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            marginRight: 8,
          }}
        >
          <img
            className="hv-logo"
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
      {titulo && (
        <div className={`hv-title ${birthstone.className}`}>{titulo}</div>
      )}
      <nav
        className="hv-nav"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minWidth: 0,
          overflow: "visible",
        }}
      >
        <div className="hv-pill">
          <div className="hv-row">
            <Dropdown label="Collections" links={collectionsLinks} href="/collections" icon="/icons/menu/collections.webp" />
            {navLink("/achievements", "Achievements", "/icons/menu/achievements.webp")}
            <Dropdown label="Shops" links={shopsLinks} href="/shops" icon="/icons/shops/store.webp" />
            <Dropdown label="More" links={moreLinks} href="/more" icon="/icons/menu/more.webp" />
          </div>
          <div className="hv-row">
            {navLink("/codes", "Redeem Codes", "/icons/menu/codes.webp")}
            {navLink("/profile", "Profile", "/icons/menu/profile.webp")}
            {navLink("/community", "Community", "/icons/menu/community.webp")}
          </div>
        </div>
      </nav>

      <form onSubmit={onSearch} className="hv-search">
        <input
          aria-label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
        />
      </form>
    </header>
  );
}