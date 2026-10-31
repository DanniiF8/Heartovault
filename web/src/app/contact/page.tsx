import type { Metadata } from "next";
import { siteConfig } from "../siteConfig";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Heartovault and report mistakes.",
};

const p = { color: "#dbe7f7", lineHeight: 1.65, margin: "0 0 12px" } as const;

export default function ContactPage() {
  const email = siteConfig.contactEmail;
  return (
    <main style={{ padding: "110px 24px 40px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.9rem", margin: "0 0 12px", color: "#e7b457" }}>Contact</h1>
      {email ? (
        <>
          <p style={p}>
            Write to us at{" "}
            <a href={`mailto:${email}`} style={{ color: "#e7b457" }}>
              {email}
            </a>
            .
          </p>
          <p style={p}>
            <strong>Found a mistake?</strong> Tell us the item name, what is wrong and, if you can, what is correct.
            On every item page there is also a “Report a mistake” link that fills this in for you.
          </p>
        </>
      ) : (
        <p style={p}>Contact details are coming soon.</p>
      )}
    </main>
  );
}
