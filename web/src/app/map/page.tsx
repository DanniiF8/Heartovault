import { Birthstone, EB_Garamond } from "next/font/google";
import PageBackground from "../components/PageBackground";
import MapViewer from "./MapViewer";

const heading = Birthstone({ subsets: ["latin"], weight: "400" });
const body = EB_Garamond({ subsets: ["latin"] });

const h1Style = {
  textShadow: "0 2px 6px rgba(0,0,0,1), 0 0 18px rgba(0,0,0,0.9)",
  fontSize: "2.7rem",
  margin: "0 0 22px",
  color: "#e7b457",
  fontWeight: 400,
  lineHeight: 1.1,
} as const;

const pStyle = {
  textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)",
  color: "#e7b457",
  lineHeight: 1.7,
  margin: "0 0 28px",
  fontSize: "1.15rem",
} as const;

export default function MapPage() {
  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      <PageBackground image="map.webp" blur={6} />
      <main className={body.className} style={{ padding: "110px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
        <h1 className={heading.className} style={h1Style}>
          Map
        </h1>
        <p style={pStyle}>Choose what to show. Drag to move, scroll or use the buttons to zoom.</p>
        <MapViewer />
      </main>
    </div>
  );
}