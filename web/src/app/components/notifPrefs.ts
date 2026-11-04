export type NotifPrefs = { master: boolean; timers: boolean; weeds: boolean };

const KEY = "hv_notif_prefs_v1";
const EVENT = "hv-notif-prefs";

export const DEFAULT_PREFS: NotifPrefs = { master: false, timers: true, weeds: false };

export function readPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw) as Partial<NotifPrefs>;
    return { master: p.master === true, timers: p.timers !== false, weeds: p.weeds === true };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writePrefs(next: NotifPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignora
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

// avisa quem estiver a ouvir (o sino e os Timers) quando as escolhas mudam
export function onPrefsChange(fn: (p: NotifPrefs) => void) {
  const handler = () => fn(readPrefs());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}