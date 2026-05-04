import { Suspense } from "react";
import type { Metadata } from "next";
import StarCandidatesTablePondicherry from "@/components/StarCandidatesTablePondicherry";
import LiveBadge from "@/components/LiveBadge";

export const metadata: Metadata = {
  title: "Star Candidates",
  description:
    "PLA 2026 results for key candidates — N. Rangasamy, A. Namassivayam, and party leaders across all alliances.",
};

export default function PondicherryStarCandidatesPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Star Candidates</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Party leaders and high-profile candidates
          </p>
        </div>
        <LiveBadge />
      </div>

      <Suspense fallback={
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 h-72 flex items-center justify-center text-gray-500 text-sm">
          Loading results...
        </div>
      }>
        <StarCandidatesTablePondicherry />
      </Suspense>
    </>
  );
}
