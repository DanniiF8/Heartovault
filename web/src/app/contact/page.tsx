import type { Metadata } from "next";
import ContactForm from "../components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Heartovault and report mistakes.",
};

const p = { color: "#e7b457", lineHeight: 1.65, margin: "0 0 16px" } as const;

export default function ContactPage() {
  return (
    <main style={{ padding: "110px 24px 40px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.9rem", margin: "0 0 12px", color: "#e7b457" }}>Contact</h1>
      <p style={p}>
        Questions, ideas or a mistake to report? Send us a message below.
      </p>
      <p style={p}>
        <strong>Found a mistake?</strong> Tell us what is wrong and, if you can, what is correct.
        On every item page there is also a “Found a mistake? Report it” link that fills in the
        item for you.
      </p>
      <ContactForm />
    </main>
  );
}