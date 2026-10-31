import type { ReactNode } from "react";

type Props = {
  label?: string;
  children?: ReactNode;
  variant?: "gold" | "grey";
  wide?: boolean;
  raw?: boolean;
  className?: string;
};

export default function TextBox({
  label,
  children,
  variant = "gold",
  wide = false,
  raw = false,
  className = "",
}: Props) {
  return (
    <>
      <style>{`
        .tb-box {
          background: linear-gradient(160deg, rgba(13, 50, 112, 0.5), rgba(7, 26, 68, 0.5));
          border: 1px solid #f0c46a;
          border-radius: 14px;
          box-shadow: 0 0 6px rgba(240, 196, 106, 0.7), inset 0 0 5px rgba(240, 196, 106, 0.35);
          padding: 12px 18px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tb-wide { width: 100%; max-width: 430px; }
        .tb-label { color: var(--hv-title); font-size: 1rem; margin-bottom: 2px; text-shadow: 0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9); }
        .tb-value { color: var(--hv-text); font-size: 1.2rem; overflow-wrap: anywhere; text-shadow: 0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9); }
        .tb-grey { border-color: #a0a0a0; box-shadow: none; }
        .tb-grey .tb-label, .tb-grey .tb-value { color: #a0a0a0; }
        @media (hover: hover) {
          .tb-box:hover {
            transform: translateY(-4px);
            box-shadow: 0 0 14px rgba(240, 196, 106, 0.95), inset 0 0 8px rgba(240, 196, 106, 0.5);
          }
        }
      `}</style>
      <div
        className={`tb-box${variant === "grey" ? " tb-grey" : ""}${wide ? " tb-wide" : ""} ${className}`}
      >
        {raw ? (
          children
        ) : (
          <>
            {label ? <div className="tb-label">{label}</div> : null}
            <div className="tb-value">{children}</div>
          </>
        )}
      </div>
    </>
  );
}