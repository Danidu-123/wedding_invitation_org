import type { Metadata, Viewport } from "next";
// Self-hosted fonts (latin subset only)
import "@fontsource/cormorant-garamond/latin-300.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-300-italic.css";
import "@fontsource/jost/latin-300.css";
import "@fontsource/jost/latin-400.css";
import "@fontsource/jost/latin-500.css";
import "@fontsource/pinyon-script/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
  ),
  title: "Thinidu & Chenaji · 10 December 2026",
  description:
    "Together with our families, we invite you to celebrate the beginning of our forever. Thursday, 10 December 2026 · Senuri Grand Castello, Divulapitiya.",
  openGraph: {
    title: "Thinidu & Chenaji · Wedding Invitation",
    description: "Thursday, 10 December 2026 · Senuri Grand Castello, Divulapitiya",
    images: [{ url: "/photos/3.jpg", width: 1064, height: 1600 }],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0c1a36" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
