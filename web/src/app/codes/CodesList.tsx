"use client";

import { useState } from "react";

export type CodeRow = {
  id: number;
  code: string;
  reward: string | null;
  note: string | null;
  expires_on: string | null;
  status: "active" | "expired";
  daysLeft: number | null;
};

const gold = "#e7b457";
const muted = "#e7b457";

export default function CodesList({ codes }: { codes: CodeRow[] }) {
  const [tab, setTab] = useState<"active" | "expired" | "all">("active");
  const [copied, setCopied] = useState<string | null>(null);

  const shown = codes.filter((c) => tab === "all" || c.status === tab);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  function expiry(c: CodeRow) {
    if (c.status === "expired") return `Expired on ${c.expires_on}`;
    if (c.daysLeft === null) return "No expiry date";
    if (c.daysLeft === 0) return "Expires today";
    if (c.daysLeft === 1) return "Expires tomorrow";
    return `Expires in ${c.daysLeft} days`;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["active", "expired", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              border: "1px solid rgba(231,180,87,0.4)",
              background: tab === t ? gold : "transparent",
              color: tab === t ? "#021432" : gold,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: "0.85rem",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p style={{ color: muted }}>No codes here yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 620 }}>
          {shown.map((c) => (
            <div
              key={c.id}
              style={{
                background: "linear-gradient(160deg, #0d3270, #071a44)",
                border: "1px solid rgba(231,180,87,0.25)",
                borderRadius: 12,
                padding: 14,
                opacity: c.status === "expired" ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <code style={{ color: "#e7b457", fontSize: "1.05rem", letterSpacing: 1 }}>{c.code}</code>
                <button
                  type="button"
                  onClick={() => copy(c.code)}
                  style={{
                    border: "1px solid rgba(231,180,87,0.4)",
                    background: "transparent",
                    color: gold,
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {copied === c.code ? "Copied!" : "Copy"}
                </button>
              </div>
              {c.reward && <div style={{ color: "#e7b457", marginTop: 8 }}>{c.reward}</div>}
              {c.note && <div style={{ color: muted, fontSize: "0.85rem", marginTop: 4 }}>{c.note}</div>}
              <div style={{ color: muted, fontSize: "0.8rem", marginTop: 8 }}>{expiry(c)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
