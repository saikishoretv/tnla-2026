import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Election Results — allelectoralresults.info",
    template: "%s | allelectoralresults.info",
  },
  description: "Live election results from India and around the world. Tamil Nadu and Kerala 2026 assembly election results.",
  metadataBase: new URL("https://allelectoralresults.info"),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    siteName: "allelectoralresults.info",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
