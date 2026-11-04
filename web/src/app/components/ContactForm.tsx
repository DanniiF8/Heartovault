"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { siteConfig } from "../siteConfig";

type Status = "idle" | "sending" | "ok" | "error";
type Report = { name: string; category: string; id: string };

const gold = "#e7b457";

const boxStyle = {
  border: `1px solid ${gold}`,
  borderRadius: 14,
  background: "rgba(10, 22, 48, 0.55)",
  color: gold,
} as const;

const labelStyle = {
  display: "block",
  margin: "0 0 6px",
  color: gold,
  fontSize: "0.95rem",
} as const;

const inputStyle = {
  ...boxStyle,
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: "1rem",
  fontFamily: "inherit",
  outline: "none",
} as const;

export default function ContactForm() {
  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("report")) {
      setReport({
        name: (q.get("name") ?? "").slice(0, 120),
        category: (q.get("category") ?? "").slice(0, 60),
        id: (q.get("id") ?? "").slice(0, 60),
      });
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    // Honeypot: um robô preenche o campo escondido, uma pessoa não.
    if (data.get("botcheck")) {
      setStatus("ok");
      return;
    }

    if (!siteConfig.web3formsKey) {
      setError("The contact form is not set up yet.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");

    const subject = report
      ? `${siteConfig.name}: correction for ${report.name || "an item"}`
      : `${siteConfig.name}: new message`;

    const senderName = String(data.get("name") ?? "").trim();
    const senderEmail = String(data.get("email") ?? "").trim();

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: siteConfig.web3formsKey,
          subject,
          from_name: siteConfig.name,
          name: senderName || "Anonymous",
          ...(senderEmail ? { email: senderEmail } : {}),
          message: String(data.get("message") ?? ""),
          ...(report
            ? {
                item_name: report.name,
                item_category: report.category,
                item_id: report.id,
              }
            : {}),
          botcheck: "",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("ok");
      } else {
        setError("Something went wrong. Please try again in a moment.");
        setStatus("error");
      }
    } catch {
      setError("Could not send. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div style={{ ...boxStyle, padding: 20, lineHeight: 1.6 }}>
        <strong>Thank you!</strong>{" "}
        {report ? "Your report was sent." : "Your message was sent."} We’ll read it soon.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
      <style>{`
        .hv-input::placeholder { color: rgba(231, 180, 87, 0.55); }
        .hv-input:focus { box-shadow: 0 0 12px rgba(231, 180, 87, 0.45); }
        .hv-send {
          all: unset !important;
          box-sizing: border-box !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
          z-index: 1 !important;
          min-width: 140px !important;
          height: 48px !important;
          padding: 0 28px !important;
          margin: 0 !important;
          transform: none !important;
          background: rgba(231, 180, 87, 0.15) !important;
          border: 1px solid #e7b457 !important;
          border-radius: 999px !important;
          color: #e7b457 !important;
          font-family: inherit !important;
          font-size: 1rem !important;
          line-height: 1 !important;
          cursor: pointer !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent;
        }
        .hv-send::before, .hv-send::after { content: none !important; }
        .hv-send:hover:not(:disabled) { box-shadow: 0 0 14px rgba(231, 180, 87, 0.55) !important; }
        .hv-send:disabled { opacity: 0.6 !important; cursor: default !important; }
      `}</style>

      {report && (
        <div style={{ ...boxStyle, padding: "12px 14px", lineHeight: 1.6 }}>
          <strong>Mistake report</strong>
          <div>Item: {report.name || "–"}</div>
          <div>Category: {report.category || "–"}</div>
          <div>ID: {report.id || "–"}</div>
        </div>
      )}

      <div>
        <label htmlFor="hv-name" style={labelStyle}>
          Name (optional)
        </label>
        <input
          id="hv-name"
          name="name"
          type="text"
          maxLength={80}
          autoComplete="name"
          className="hv-input"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="hv-email" style={labelStyle}>
          Email (optional, only if you want a reply)
        </label>
        <input
          id="hv-email"
          name="email"
          type="email"
          maxLength={120}
          autoComplete="email"
          className="hv-input"
          style={inputStyle}
        />
        <div style={{ marginTop: 6, fontSize: "0.85rem", opacity: 0.8 }}>
          Leave name and email empty to send anonymously.
        </div>
      </div>

      <div>
        <label htmlFor="hv-message" style={labelStyle}>
          {report ? "What is wrong, and what is correct?" : "Message"}
        </label>
        <textarea
          id="hv-message"
          name="message"
          required
          rows={6}
          maxLength={2000}
          className="hv-input"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Honeypot: escondido de pessoas, os robôs preenchem-no */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      {status === "error" && <div style={{ color: gold }}>{error}</div>}

      <div style={{ display: "flex" }}>
        <button type="submit" disabled={status === "sending"} className="hv-send">
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}