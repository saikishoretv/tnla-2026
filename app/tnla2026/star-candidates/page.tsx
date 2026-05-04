import { Suspense } from "react";
import type { Metadata } from "next";
import StarCandidatesTable from "@/components/StarCandidatesTable";
import LiveBadge from "@/components/LiveBadge";

export const metadata: Metadata = {
  title: "Star Candidates",
  description:
    "Live TNLA 2026 results for high-profile star candidates — Vijay, MK Stalin, Udhayanidhi, Edappadi, Seeman and more. Track who is leading and trailing in key constituencies.",
};

export default function StarCandidatesPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Star Candidates</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Key political figures and high-profile candidates — live results
          </p>
        </div>
        <LiveBadge />
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 h-72 flex items-center justify-center text-gray-500 text-sm">
            Fetching live results...
          </div>
        }
      >
        <StarCandidatesTable />
      </Suspense>
    </>
  );
}
