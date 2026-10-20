import type { Metadata } from "next";
import { siteConfig } from "../siteConfig";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Heartovault handles your data.",
};

const h2 = { fontSize: "1.2rem", color: "#e7b457", margin: "28px 0 8px" } as const;
const p = { color: "#dbe7f7", lineHeight: 1.65, margin: "0 0 12px" } as const;
const li = { color: "#dbe7f7", lineHeight: 1.65, marginBottom: 6 } as const;

export default function PrivacyPage() {
  const email = siteConfig.contactEmail;
  return (
    <main style={{ padding: "110px 24px 40px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.9rem", margin: "0 0 4px", color: "#e7b457" }}>Privacy Policy</h1>
      <p style={{ ...p, color: "#94a3b8" }}>Last updated: {siteConfig.lastUpdated}</p>

      <h2 style={h2}>Who we are</h2>
      <p style={p}>
        {siteConfig.name} is an unofficial fan project run by an individual based in France.{" "}
        {email ? (
          <>
            You can contact us at{" "}
            <a href={`mailto:${email}`} style={{ color: "#f3d98b" }}>
              {email}
            </a>
            .
          </>
        ) : (
          "Contact details are coming soon."
        )}
      </p>

      <h2 style={h2}>What stays in your browser</h2>
      <p style={p}>
        Your progress (the items you mark as obtained) and your timers are saved in your browser’s local storage. They
        are not sent to us. You can delete them at any time by clearing this site’s data in your browser.
      </p>

      <h2 style={h2}>If you sign in with Google</h2>
      <p style={p}>Signing in is optional. If you do, we receive, through our database provider (Supabase):</p>
      <ul style={{ paddingLeft: 20, margin: "0 0 12px" }}>
        <li style={li}>your email address and the basic profile information Google shares (such as name and picture);</li>
        <li style={li}>the username and avatar you choose on your profile.</li>
      </ul>
      <p style={p}>
        We use this only to keep your profile and your progress. We never see your Google password. You can ask us to
        delete your account and data at any time.
      </p>

      <h2 style={h2}>Hosting and technical data</h2>
      <p style={p}>
        The site is hosted by Vercel and the database is hosted by Supabase. These providers may process technical data
        such as your IP address to deliver and protect the service, and may process data outside the European Union
        with appropriate safeguards.
      </p>

      <h2 style={h2}>Cookies, ads and analytics</h2>
      <p style={p}>
        We do not use advertising or tracking cookies and, at the moment, we do not use analytics. If you sign in, a
        session is stored in your browser so you stay signed in. If this changes, we will update this page.
      </p>

      <h2 style={h2}>Sharing</h2>
      <p style={p}>We do not sell your data. It is shared only with the providers above, to run the site.</p>

      <h2 style={h2}>Your rights</h2>
      <p style={p}>
        Under European data protection law (GDPR) you can ask to access, correct, delete or export your data, and to
        object to its use. {email ? `Write to ${email}. ` : ""}You can also complain to the French data protection
        authority (CNIL) or to your local authority.
      </p>

      <h2 style={h2}>Children</h2>
      <p style={p}>This site is not directed at children under 15, and we do not knowingly collect their data.</p>

      <h2 style={h2}>Changes</h2>
      <p style={p}>We may update this policy. The date at the top shows the latest version.</p>
    </main>
  );
}
