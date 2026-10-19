"use client";

import { itemKey, useProgress } from "../lib/progress";

export default function ObtainedButton({
  item,
}: {
  item: { name?: string | null; set?: string | null; item_key?: string | null };
}) {
  const progress = useProgress();
  const key = itemKey(item);
  const owned = progress.has(key);
  return (
    <button
      type="button"
      aria-pressed={owned}
      onClick={() => progress.toggle(key)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 18px",
        borderRadius: 999,
        cursor: "pointer",
        fontWeight: 600,
        border: owned ? "1px solid #e7b457" : "1px solid rgba(231,180,87,0.4)",
        background: owned ? "#e7b457" : "transparent",
        color: owned ? "#021432" : "#e7b457",
        marginBottom: 16,
      }}
    >
      {owned ? "✓ Obtained" : "Mark as obtained"}
    </button>
  );
}
