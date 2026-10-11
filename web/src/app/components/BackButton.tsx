"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        background: "transparent",
        border: "none",
        color: "#7dd3fc",
        cursor: "pointer",
        padding: 0,
        fontSize: "0.95rem",
      }}
    >
      ← {label}
    </button>
  );
}