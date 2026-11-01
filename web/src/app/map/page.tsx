import { EB_Garamond } from "next/font/google";
import PageBackground from "../components/PageBackground";
import MapViewer from "./MapViewer";

const body = EB_Garamond({ subsets: ["latin"] });

export default function MapPage() {
  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="map.webp" blur={6} />
      <main className={body.className} style={{ padding: "110px 16px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <MapViewer />
      </main>
    </div>
  );
}