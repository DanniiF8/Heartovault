import type { Metadata } from "next";
import { Birthstone, EB_Garamond } from "next/font/google";
import PageBackground from "../components/PageBackground";

const heading = Birthstone({ subsets: ["latin"], weight: "400" });
const body = EB_Garamond({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "About",
  description: "About Heartovault, an unofficial fan database and collection tracker for Heartopia.",
};

const h2 = { textShadow: "0 2px 6px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.9)", fontSize: "2.7rem", color: "#e7b457", margin: "44px 0 18px", fontWeight: 400, lineHeight: 1.1 } as const;
const p = { textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)", color: "#e7b457", lineHeight: 1.7, margin: "0 0 14px", fontSize: "1.15rem" } as const;
const link = { color: "var(--hv-link)", textDecoration: "underline" } as const;
const emoji = { fontSize: "1.2rem", marginLeft: 6 } as const;

export default function AboutPage() {
  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="about.webp" />
      <main className={body.className} style={{ padding: "110px 24px 60px", maxWidth: 760, margin: "0 auto" }}>
        <h1 className={heading.className} style={{ textShadow: "0 2px 6px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.9)", fontSize: "2.7rem", margin: "0 0 22px", color: "#e7b457", fontWeight: 400, lineHeight: 1.1 }}>
          About Heartovault
        </h1>
        <p style={p}>Baboo, D.G. Members! 🩵</p>
        <p style={p}>Welcome to Heartovault — your little home for all things collectible in Heartopia!</p>
        <p style={p}>
          Ever caught a fish and wondered, “Wait… did I already have this one?” Spent ages looking for that one bird? Or
          discovered you were missing just one item to complete a collection? We’ve been there!
        </p>
        <p style={p}>
          That’s why Heartovault exists: to help you keep track of what you’ve collected, discover what’s still missing,
          and plan your next adventure around Heartopia.
        </p>
        <p style={p}>
          From fish, birds, and insects to crops, recipes, outfits, furniture, and more, there’s plenty to discover — and
          we’re here to help you keep track of it all.
        </p>
        <p style={p}>Less guessing, more collecting. Happy exploring, D.G. Members! ✨</p>

        <h2 className={heading.className} style={h2}>Made with love, by fans, for fans</h2>
        <p style={p}>
          Heartovault is an unofficial fan project created by a fellow Heartopia enthusiast, for everyone who loves
          exploring, collecting, decorating, and enjoying the little things in the game.
        </p>
        <p style={p}>
          Heartopia is developed and published by XD (XD Inc.). Heartovault is an independent community project and is
          not affiliated with, endorsed by, sponsored by, or connected to XD or the official Heartopia team.
        </p>
        <p style={p}>
          All rights to Heartopia, including its name, characters, artwork, and other game content, belong to their
          respective owners.
        </p>
        <p style={p}>
          We’re simply fans who wanted a handy place to organise our collections and share the joy of discovering
          everything Heartopia has to offer. No official connections, no secret developer privileges — just a whole lot
          of love for the game!
        </p>

        <h2 className={heading.className} style={h2}>A growing collection, just like the game</h2>
        <p style={p}>
          Heartopia is always evolving, and so is the world of things to discover. New updates, seasonal events,
          limited-time items, and other surprises can make keeping track of everything quite the adventure!
        </p>
        <p style={p}>
          We collect and check Heartovault’s information by hand while playing, doing our best to make it as accurate,
          useful, and up to date as possible.
        </p>
        <p style={p}>
          Still, we’re human (and occasionally distracted by a cute bird). Some details may be incomplete, incorrect, or
          out of date, especially after a game update.
        </p>
        <p style={p}>
          Spotted a mistake? Found something we’ve missed? Have information that could help another collector?
        </p>
        <p style={p}>
          Please tell us! Every correction and contribution helps make Heartovault a better place for the whole
          community.
        </p>
        <p style={p}>After all, collecting is more fun when we help each other along the way.🐦</p>

        <h2 className={heading.className} style={h2}>Your progress, your adventure</h2>
        <p style={p}>Your collection belongs to you — no account required!</p>
        <p style={p}>
          When you mark an item as collected, your progress is saved directly in your browser. That means you can start
          tracking your discoveries right away, without another password to remember.
        </p>
        <p style={p}>Want to create a profile? You can also optionally sign in with Google.</p>
        <p style={p}>
          Curious about how your data is handled? Take a look at our{" "}
          <a href="/privacy" style={link}>Privacy Policy</a> for all the details.
        </p>
        <p style={p}>
          Now, go on and mark those cards as collected. We won’t judge if watching your collection fill up feels almost
          as satisfying as catching the fish itself.
        </p>

        <h2 className={heading.className} style={h2}>
          Found something? Tell us about it! <span style={emoji}>💌</span>
        </h2>
        <p style={p}>
          Spotted a mistake? Discovered something missing? Got an idea that could make Heartovault even better?
        </p>
        <p style={p}>
          We’re always happy to hear from fellow D.G. Members! Whether it’s a little correction, a helpful discovery, or
          a suggestion for something new, your feedback helps Heartovault grow and become more useful for everyone.
        </p>
        <p style={p}>
          After all, Heartopia is full of little discoveries, and sharing them makes the adventure even better.
        </p>
        <p style={p}>
          Have something in mind? Head over to our <a href="/contact" style={link}>Contact Page</a> and let us know!
        </p>
        <p style={p}>
          No discovery is too small, no suggestion is silly, and yes, we absolutely want to hear about that fish you just
          spent 40 minutes trying to catch. 🐟
        </p>

        <h2 className={heading.className} style={h2}>One last thing before you go...</h2>
        <p style={p}>
          Thank you for stopping by Heartovault and being part of this little fan-made adventure.
        </p>
        <p style={p}>
          Whether you’re a completionist determined to collect absolutely everything, a casual explorer who likes to tick
          off a few discoveries, or someone who just wants to remember which furniture they’ve already collected,
          there’s a place for you here.
        </p>
        <p style={p}>
          Take your time, enjoy the journey, and don’t forget that Heartopia is about more than completing collections —
          it’s about the little moments, the lovely discoveries, and the memories we make along the way.
        </p>
        <p style={p}>Baboo, D.G. Members! Happy collecting, and see you around Heartopia! ✨🩵</p>
      </main>
    </div>
  );
}