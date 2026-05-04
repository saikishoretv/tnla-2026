import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAllConstituencies } from "@/lib/eci";
import ConstituencyTable from "@/components/ConstituencyTable";
import ConstituencyFilters from "@/components/ConstituencyFilters";
import LiveBadge from "@/components/LiveBadge";
import type { Constituency } from "@/lib/types";
import { ALLIANCES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Constituency Results",
  description:
    "Live TNLA 2026 results for all 234 Tamil Nadu assembly constituencies. Filter by party, district, alliance, and status.",
};

type SearchParams = Promise<{
  q?: string;
  party?: string;
  district?: string;
  alliance?: string;
  status?: string;
  page?: string;
}>;

function filterConstituencies(
  all: Constituency[],
  filters: {
    q: string;
    party: string;
    district: string;
    alliance: string;
    status: string;
  }
): Constituency[] {
  return all.filter((c) => {
    if (
      filters.q &&
      !c.name.toLowerCase().includes(filters.q.toLowerCase()) &&
      !c.leadingCandidate.toLowerCase().includes(filters.q.toLowerCase())
    )
      return false;
    if (filters.party && c.leadingParty !== filters.party) return false;
    if (filters.district && c.district !== filters.district) return false;
    if (
      filters.alliance &&
      ALLIANCES[c.leadingParty] !== filters.alliance
    )
      return false;
    if (filters.status && c.status !== filters.status) return false;
    return true;
  });
}

async function ResultsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const party = sp.party ?? "";
  const district = sp.district ?? "";
  const alliance = sp.alliance ?? "";
  const status = sp.status ?? "";
  const page = parseInt(sp.page ?? "1") || 1;

  const all = await fetchAllConstituencies();
  const filtered = filterConstituencies(all, {
    q,
    party,
    district,
    alliance,
    status,
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">
            All Constituency Results
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {filtered.length} of {all.length} constituencies
          </p>
        </div>
        <LiveBadge />
      </div>

      <div className="mb-5">
        <ConstituencyFilters constituencies={all} />
      </div>

      <ConstituencyTable constituencies={filtered} page={page} />
    </>
  );
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-64 text-gray-500">
          Loading constituency data...
        </div>
      }
    >
      <ResultsContent searchParams={searchParams} />
    </Suspense>
  );
}
