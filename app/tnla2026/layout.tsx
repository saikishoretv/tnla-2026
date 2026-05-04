import type { Metadata } from "next";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "TNLA 2026 Election Results | Tamil Nadu Assembly Election",
    template: "%s | TNLA 2026 Results",
  },
  description:
    "Live Tamil Nadu Legislative Assembly (TNLA) 2026 election results. Track constituency-wise winners, party-wise seat tally, alliance standings, and vote counts across all 234 constituencies.",
  keywords: [
    "TNLA 2026",
    "Tamil Nadu election results 2026",
    "Tamil Nadu assembly election",
    "DMK",
    "TVK",
    "AIADMK",
    "Vijay TVK",
    "Stalin DMK",
    "234 constituencies",
  ],
  openGraph: {
    title: "TNLA 2026 Election Results | Tamil Nadu Assembly Election",
    description:
      "Live results for all 234 Tamil Nadu assembly constituencies. Party tally, winners, vote margins updated every 10 minutes.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "TNLA 2026 Election Results",
    description:
      "Live Tamil Nadu assembly election 2026 results — all 234 constituencies.",
  },
};

export default function Tnla2026Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/tnla2026" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              TNLA 2026
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-medium">
              RESULTS
            </span>
          </Link>
          <Suspense fallback={null}>
            <NavLinks />
          </Suspense>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      <footer className="border-t border-gray-800/60 mt-16 py-6 text-center text-xs text-gray-600">
        <p>
          Data sourced from{" "}
          <a
            href="https://results.eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300 underline"
          >
            Election Commission of India
          </a>
          . Updated every 10 minutes. Not affiliated with ECI.
        </p>
      </footer>
    </>
  );
}
