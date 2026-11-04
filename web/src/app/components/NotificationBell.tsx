"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_PREFS, onPrefsChange, readPrefs, writePrefs } from "./notifPrefs";
import type { NotifPrefs } from "./notifPrefs";

const GOLD = "#e7b457";

type OneSignalLike = {
  Notifications: { requestPermission: () => Promise<void> };
  User: { PushSubscription: { optIn: () => Promise<void>; optOut: () => Promise<void> } };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: OneSignalLike) => void | Promise<void>>;
  }
}

// corre algo no OneSignal quando ele estiver pronto (desiste ao fim de 8 s, por ex. com bloqueador de anúncios)
function withOneSignal(fn: (os: OneSignalLike) => Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 8000);
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
    setBusy(true);
    if (on) {
      await withOneSignal(async (os) => {
        await os.User.PushSubscription.optOut();
      });
      writePrefs({ ...readPrefs(), master: false });
    } else if (perm !== "unsupported" && perm !== "denied") {
      await withOneSignal(async (os) => {
        await os.Notifications.requestPermission();
        if (Notification.permission === "granted") await os.User.PushSubscription.optIn();
      });
      const p = currentPerm();
      setPerm(p);
      writePrefs({ ...readPrefs(), master: p === "granted" });
    }
    setBusy(false);
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
          width: 38px;
          height: 38px;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        /* luz por trás, igual à dos cards */
        .hv-bell::before {
          content: "";
          position: absolute;
          inset: -30%;
          z-index: -1;
          background: radial-gradient(closest-side, var(--aura), transparent);
          opacity: 0;
          transition: opacity 0.8s ease;
          pointer-events: none;
        }
        .hv-bell.on { --aura: rgba(255, 196, 80, 0.6); }
        .hv-bell.on::before { opacity: 1; animation: hvBellPulse 3.5s ease-in-out infinite; }
        .hv-bell svg { filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9)); transition: transform 0.2s ease; }
        @media (hover: hover) { .hv-bell:hover svg { transform: scale(1.12); } }
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
        .hv-n-cats.off { opacity: 0.5; }
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
        .hv-sw:disabled { opacity: 0.4; cursor: default; }

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
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          aria-hidden="true"
          fill={on ? GOLD : "none"}
          stroke={GOLD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
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
            <p className="hv-n-note">Turn notifications on to choose what you receive.</p>
          )}

          <div className={`hv-n-cats${on ? "" : " off"}`} style={{ marginTop: 6 }}>
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
                  disabled={!on}
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