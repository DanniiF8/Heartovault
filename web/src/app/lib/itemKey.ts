// Chave estável de cada item (sem depender do número da linha). Pode usar-se no servidor e no browser.
export type Keyed = { name?: string | null; set?: string | null; item_key?: string | null };

export function slug(v: unknown): string {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Usa a coluna item_key quando existir; senão, nome + set.
export function itemKey(item: Keyed): string {
  const given = String(item.item_key ?? "").trim();
  if (given) return given;
  const n = slug(item.name);
  const s = slug(item.set);
  return s ? `${n}~${s}` : n;
}
