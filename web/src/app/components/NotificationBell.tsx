"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_PREFS, onPrefsChange, readPrefs, writePrefs } from "./notifPrefs";
import type { NotifPrefs } from "./notifPrefs";

const GOLD = "#e7b457";

type OneSignalLike = {
  User: { PushSubscription: { optIn: () => Promise<void>; optOut: () => Promise<void> } };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: OneSignalLike) => void | Promise<void>>;
  }
}

// corre algo no OneSignal quando ele estiver pronto. Nunca bloqueia nada:
// se o OneSignal não carregar (ou o endereço não for o do site publicado), desiste em silêncio.
function withOneSignal(fn: (os: OneSignalLike) => Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 4000);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (os) => {
      try {
        await fn(os);
      } catch {
        // ignora
      }
      clearTimeout(timer);
      resolve();
    });
  });
}

type Perm = NotificationPermission | "unsupported";

function currentPerm(): Perm {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export default function NotificationBell() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [perm, setPerm] = useState<Perm>("default");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // se existir /icons/menu/bell.webp usa essa imagem; senão usa o sino desenhado aqui
  const [imgOk, setImgOk] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPerm(currentPerm());
    setPrefs(readPrefs());
    return onPrefsChange(setPrefs);
  }, []);

  // fecha ao clicar fora ou com Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const on = prefs.master && perm === "granted";

  async function toggleMaster() {
    if (busy) return;

    // desligar: muda já, e avisa o OneSignal em segundo plano
    if (on) {
      writePrefs({ ...readPrefs(), master: false });
      void withOneSignal(async (os) => {
        await os.User.PushSubscription.optOut();
      });
      return;
    }

    if (typeof Notification === "undefined") return;

    // ligar: primeiro a permissão do navegador (tem de ser logo ao clicar)
    setBusy(true);
    let p: NotificationPermission = Notification.permission;
    if (p === "default") p = await Notification.requestPermission();
    setPerm(p);
    setBusy(false);

    if (p === "granted") {
      writePrefs({ ...readPrefs(), master: true });
      // regista o aparelho no OneSignal (só funciona no site publicado)
      void withOneSignal(async (os) => {
        await os.User.PushSubscription.optIn();
      });
    }
  }

  function toggleCat(key: "timers" | "weeds") {
    writePrefs({ ...prefs, [key]: !prefs[key] });
  }

  const cats: { key: "timers" | "weeds"; title: string; sub: string }[] = [
    { key: "timers", title: "Timers ready", sub: "When a timer finishes." },
    { key: "weeds", title: "Weed alerts", sub: "When weeds grow on your crops." },
  ];

  return (
    <div className="hv-bell-wrap" ref={wrapRef}>
      <style>{`
        .hv-bell-wrap { position: relative; flex-shrink: 0; }
        .hv-bell {
          --aura: transparent;
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        /* luz por trás, igual à dos cards */
        .hv-bell::before {
          content: "";
          position: absolute;
          inset: -25%;
          z-index: -1;
          background: radial-gradient(closest-side, var(--aura), transparent);
          opacity: 0;
          transition: opacity 0.8s ease;
          pointer-events: none;
        }
        .hv-bell.on { --aura: rgba(255, 196, 80, 0.6); }
        .hv-bell.on::before { opacity: 1; animation: hvBellPulse 3.5s ease-in-out infinite; }

        /* desligado: a preto e branco, como os cards por obter; ligado: dourado com brilho */
        .hv-bell-ico {
          display: flex;
          filter: grayscale(1) brightness(0.85) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9));
          transition: filter 0.6s ease, transform 0.2s ease;
        }
        .hv-bell.on .hv-bell-ico {
          filter: drop-shadow(0 0 6px rgba(255, 205, 90, 0.85)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9));
        }
        @media (hover: hover) { .hv-bell:hover .hv-bell-ico { transform: scale(1.1); } }
        @keyframes hvBellPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .hv-bell.on::before { animation: none; } }

        .hv-bell-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
          width: min(300px, calc(100vw - 24px));
          box-sizing: border-box;
          padding: 10px 16px 12px;
          background: rgba(0, 16, 40, 0.92);
          border: 1px solid rgba(231, 180, 87, 0.35);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
          color: ${GOLD};
          z-index: 9999;
        }
        .hv-n-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; }
        .hv-n-cats .hv-n-row { border-top: 1px solid rgba(231, 180, 87, 0.15); }
        .hv-n-title { font-weight: 700; font-size: 0.95rem; }
        .hv-n-sub { font-size: 0.8rem; opacity: 0.8; }
        .hv-n-note { font-size: 0.8rem; opacity: 0.85; margin: 4px 0 0; line-height: 1.3; }
        .hv-sw {
          position: relative;
          width: 42px;
          height: 24px;
          flex-shrink: 0;
          padding: 0;
          border-radius: 999px;
          border: 1px solid rgba(231, 180, 87, 0.45);
          background: rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .hv-sw::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${GOLD};
          opacity: 0.7;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .hv-sw[aria-checked="true"] {
          background: rgba(231, 180, 87, 0.25);
          border-color: #f0c46a;
          box-shadow: 0 0 10px rgba(240, 196, 106, 0.45);
        }
        .hv-sw[aria-checked="true"]::after { transform: translateX(18px); opacity: 1; }
        .hv-sw:disabled { opacity: 0.5; cursor: default; }

        /* telemóvel: o painel ocupa a largura do cabeçalho */
        @media (max-width: 700px) {
          .hv-bell-wrap { position: static; }
          .hv-bell-panel { left: 8px; right: 8px; width: auto; }
        }
      `}</style>

      <button
        type="button"
        className={`hv-bell${on ? " on" : ""}`}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setPerm(currentPerm());
          setOpen((v) => !v);
        }}
      >
        <span className="hv-bell-ico">
          {imgOk ? (
            <img
              src="/icons/menu/bell.webp"
              alt=""
              width={34}
              height={34}
              style={{ objectFit: "contain" }}
              onError={() => setImgOk(false)}
            />
          ) : (
            <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
              <defs>
                <linearGradient id="hvBellGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffe9a3" />
                  <stop offset="45%" stopColor="#e7b457" />
                  <stop offset="100%" stopColor="#a8741f" />
                </linearGradient>
              </defs>
              {/* badalo */}
              <path d="M12.6 25.4a3.4 3.4 0 0 0 6.8 0z" fill="url(#hvBellGrad)" stroke="#7a5217" strokeWidth="0.8" strokeLinejoin="round" />
              {/* corpo */}
              <path
                d="M16 3c-1.1 0-2 .9-2 2v.6C10.6 6.6 8.5 9.6 8.5 13.2v4.3c0 1.2-.5 2.3-1.3 3.2L6 22c-.4.5-.1 1.3.6 1.3h18.8c.7 0 1-.8.6-1.3l-1.2-1.3c-.8-.9-1.3-2-1.3-3.2v-4.3c0-3.6-2.1-6.6-5.5-7.6V5c0-1.1-.9-2-2-2z"
                fill="url(#hvBellGrad)"
                stroke="#7a5217"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              {/* aro de baixo */}
              <path d="M7 22.2h18" stroke="#7a5217" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
              {/* brilho */}
              <path d="M11.4 14c0-2.3 1.2-4.2 3.1-5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>

      {open && (
        <div className="hv-bell-panel" role="dialog" aria-label="Notification settings">
          <div className="hv-n-row">
            <div>
              <div className="hv-n-title">Notifications</div>
              <div className="hv-n-sub">{on ? "On for this device" : "Off"}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label="Notifications on or off"
              className="hv-sw"
              disabled={busy || perm === "unsupported" || (perm === "denied" && !on)}
              onClick={toggleMaster}
            />
          </div>

          {perm === "denied" && (
            <p className="hv-n-note">
              Blocked in your browser. Allow notifications for this site (padlock next to the address), then try again.
            </p>
          )}
          {perm === "unsupported" && <p className="hv-n-note">This browser does not support notifications.</p>}
          {!on && perm !== "denied" && perm !== "unsupported" && (
            <p className="hv-n-note">Choose what you want to be notified about, then turn notifications on.</p>
          )}

          <div className="hv-n-cats" style={{ marginTop: 6 }}>
            {cats.map((c) => (
              <div className="hv-n-row" key={c.key}>
                <div>
                  <div className="hv-n-title">{c.title}</div>
                  <div className="hv-n-sub">{c.sub}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[c.key]}
                  aria-label={c.title}
                  className="hv-sw"
                  onClick={() => toggleCat(c.key)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}