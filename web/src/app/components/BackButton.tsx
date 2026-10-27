"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingLeft: 16 }}>
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--hv-link)",
          cursor: "pointer",
          padding: 0,
          marginBottom: 10,
          fontSize: "1.15rem",
        }}
      >
        ← {label}
      </button>
    </div>
  );
}