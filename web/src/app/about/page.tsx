import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Heartovault, an unofficial fan database and collection tracker for Heartopia.",
};

const h2 = { fontSize: "1.2rem", color: "#e7b457", margin: "28px 0 8px" } as const;
const p = { color: "#dbe7f7", lineHeight: 1.65, margin: "0 0 12px" } as const;

export default function AboutPage() {
  return (
    <main style={{ padding: "110px 24px 40px", maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.9rem", margin: "0 0 12px", color: "#e7b457" }}>About Heartovault</h1>
      <p style={p}>
        Heartovault is a fan-made database and collection tracker for Heartopia. It helps you find what you are
        missing, plan your hobbies and keep track of your progress: fish, birds, insects, crops, recipes, outfits,
        furniture and more.
      </p>

      <h2 style={h2}>An unofficial fan project</h2>
      <p style={p}>
        Heartovault is not affiliated with, endorsed by or connected to the makers or publishers of Heartopia.
        Heartopia, its name, characters, images and all game content belong to their respective owners. This site is
        made by a fan, for fans, and has no commercial link with the game.
      </p>

      <h2 style={h2}>About the information</h2>
      <p style={p}>
        The data is collected and checked by hand while playing, and the game changes often. Some details may be
        wrong or out of date. If you notice a mistake, please tell us, it helps everyone.
      </p>

      <h2 style={h2}>Your progress</h2>
      <p style={p}>
        What you mark as obtained is saved in your browser, so you do not need an account. You can optionally sign
        in with Google to keep a profile. See the <a href="/privacy" style={{ color: "#f3d98b" }}>privacy policy</a>{" "}
        for details.
      </p>

      <h2 style={h2}>Get in touch</h2>
      <p style={p}>
        Questions, corrections or ideas? Visit the <a href="/contact" style={{ color: "#f3d98b" }}>contact page</a>.
      </p>
    </main>
  );
}
