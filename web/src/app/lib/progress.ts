"use client";

import { useSyncExternalStore } from "react";
import { itemKey, slug } from "./itemKey";

// O progresso fica guardado neste browser (localStorage), sem conta.
// Cada item tem uma chave estável: usa a coluna item_key quando existir; senão, nome + set.
const KEY = "hv_progress_v1";

export { itemKey, slug };

let data = new Set<string>();
let loaded = false;
let version = 0;
let storageBound = false;
const listeners = new Set<() => void>();

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    const list = (parsed as { obtained?: unknown })?.obtained;
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, obtained: Array.from(data) }));
  } catch {
    // sem espaço ou sem acesso: o progresso fica só nesta visita
  }
}

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  if (!loaded) {
    data = read();
    loaded = true;
    version++;
  }
  listeners.add(cb);
  if (!storageBound) {
    storageBound = true;
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) {
        data = read();
        emit();
      }
    });
  }
  return () => {
    listeners.delete(cb);
  };
}

const getVersion = () => version;
const getServerVersion = () => 0;

export function useProgress() {
  const v = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  return {
    version: v,
    has: (key: string) => data.has(key),
    toggle: (key: string) => {
      if (data.has(key)) data.delete(key);
      else data.add(key);
      write();
      emit();
    },
  };
}
