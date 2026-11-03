import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./Header";
import Footer from "./Footer";
import { siteUrl } from "./siteConfig";
import Script from "next/script";

const description = "Discover, collect, and treasure every find in Heartopia.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: "Heartovault", template: "%s | Heartovault" },
  description,
  applicationName: "Heartovault",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "Heartovault",
    description,
    siteName: "Heartovault",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heartovault",
    description,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#06122e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#0a1431",
          color: "#e7b457",
          fontFamily: "system-ui, sans-serif",
          overflowX: "hidden",
        }}
      >
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="afterInteractive" />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function (OneSignal) {
              await OneSignal.init({
                appId: "b783d098-7b42-462a-9253-62b3c002f447",
                notifyButton: { enable: true },
              });
            });
          `}
        </Script>

        {/* aqui continua tudo o que já tinhas (Header, children, Footer...) */}
        <Header />
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}