"use client";

import { useEffect, useState } from "react";

// estrelas e mastery de cada item, guardados neste browser
// s = estrelas (0 a 5), m = mastery (0 a 3)
const KEY = "hv_stars_v1";
export type StarsEntry = { s: number; m: number };
type Store = Record<string, StarsEntry>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // sem armazenamento: ignora
  }
}

export function useStars() {
  const [store, setStore] = useState<Store>({});

  useEffect(() => {
    setStore(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setStore(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const get = (key: string): StarsEntry => store[key] ?? { s: 0, m: 0 };

  const set = (key: string, entry: StarsEntry) => {
    const next: Store = { ...store };
    if (entry.s <= 0 && entry.m <= 0) delete next[key];
    else next[key] = entry;
    setStore(next);
    write(next);
  };

  return { get, set };
}