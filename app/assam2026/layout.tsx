import type { Metadata } from "next";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import ElectionSwitcher from "@/components/ElectionSwitcher";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "ALA 2026 Election Results | Assam Assembly Election",
    template: "%s | ALA 2026 Results",
  },
  description:
    "Live Assam Legislative Assembly (ALA) 2026 election results. Constituency-wise winners, party tally, and alliance standings across all 126 constituencies.",
  keywords: ["ALA 2026", "Assam election results 2026", "Assam assembly election", "BJP", "INC", "AGP", "AIUDF", "Himanta Biswa Sarma", "126 constituencies"],
  openGraph: {
    title: "ALA 2026 Election Results | Assam Assembly Election",
    description: "Live results for all 126 Assam assembly constituencies.",
    type: "website",
    locale: "en_IN",
  },
};

export default function Assam2026Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Assam Legislative Assembly Election 2026",
    "alternateName": "ALA 2026",
    "startDate": "2026-05-04",
    "endDate": "2026-05-04",
    "location": { "@type": "Place", "name": "Assam, India" },
    "description": "Assam Legislative Assembly Election 2026. Results for all 126 constituencies.",
    "organizer": { "@type": "GovernmentOrganization", "name": "Election Commission of India", "url": "https://eci.gov.in" },
    "url": "https://allelectoralresults.info/assam2026",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center sm:justify-start">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl" aria-label="Home">☝️</Link>
            <Suspense fallback={null}>
              <ElectionSwitcher />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <NavLinks links={[
              { href: "/assam2026", label: "Dashboard" },
              { href: "/assam2026/results", label: "All Results" },
              { href: "/assam2026/star-candidates", label: "Star Candidates" },
            ]} />
          </Suspense>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      <footer className="border-t border-gray-800/60 mt-16 py-6 text-center text-xs text-gray-600">
        <p>
          Data sourced from{" "}
          <a href="https://results.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 underline">
            Election Commission of India
          </a>
          . Not affiliated with ECI.
        </p>
      </footer>
    </>
  );
}
