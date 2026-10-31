import { moreLinks } from "../menuLinks";
import PageBackground from "../components/PageBackground";
import CollectionsGrid, { CollectionTile } from "../collections/CollectionsGrid";

export default function MorePage() {
  const tiles: CollectionTile[] = moreLinks.map((l) => ({
    href: l.href,
    label: l.label,
    icon: l.icon,
    keys: [],
  }));

  return (
    <div style={{ position: "relative", isolation: "isolate", minHeight: "100vh" }}>
      <PageBackground image="more.webp" blur={6} />
      <main
        style={{
          padding: "110px 24px 24px",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <CollectionsGrid tiles={tiles} />
      </main>
    </div>
  );
}