import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";

export const metadata: Metadata = {
  title: "Heartovault",
  description: "Discover, collect, and treasure every find in Heartopia",
  icons: {
    icon: "/favicon.png",
  },
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
          background: "#000",
          color: "#e7b457",
          fontFamily: "system-ui, sans-serif",
          overflowX: "hidden",
        }}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}