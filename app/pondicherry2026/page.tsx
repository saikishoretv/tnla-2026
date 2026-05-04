import { Suspense } from "react";
import Link from "next/link";
import { fetchPondicherrySummary } from "@/lib/eci";
import PartyCard from "@/components/PartyCard";
import MajorityTracker from "@/components/MajorityTracker";
import LiveBadge from "@/components/LiveBadge";
import PartySeatChart from "@/components/PartySeatChart";

async function DashboardContent() {
  const summary = await fetchPondicherrySummary();
  const leadingParty = summary.parties[0];

  const allianceTotals = summary.parties.reduce<Record<string, number>>((acc, p) => {
    acc[p.alliance] = (acc[p.alliance] ?? 0) + p.total;
    return acc;
  }, {});

  const allianceBadges = [
    { label: "NDA Alliance", seats: allianceTotals["NDA Alliance"] ?? 0, color: "#F97316" },
    { label: "INC Alliance", seats: allianceTotals["INC Alliance"] ?? 0, color: "#3B82F6" },
    { label: "TVK (Solo)", seats: allianceTotals["TVK (Solo)"] ?? 0, color: "#FACC15" },
    { label: "Others", seats: allianceTotals["Others"] ?? 0, color: "#6B7280" },
  ].filter((a) => a.seats > 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Pondicherry Assembly Election 2026</h1>
          <p className="text-gray-400 text-sm mt-1">
            {summary.statusLine ? `Status known for ${summary.statusLine}` : "30 Assembly Constituencies"}
          </p>
        </div>
        <LiveBadge lastUpdated={summary.lastUpdated} />
      </div>

      <div className="mb-6">
        <MajorityTracker parties={summary.parties} majority={summary.majority} total={summary.total} />
      </div>

      {leadingParty && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div
            className="sm:col-span-1 rounded-xl p-4 border flex items-center gap-3"
            style={{ backgroundColor: leadingParty.color + "11", borderColor: leadingParty.color + "44" }}
          >
            <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: leadingParty.color }} />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Currently Leading</p>
              <p className="font-semibold text-white">
                <span style={{ color: leadingParty.color }}>{leadingParty.party}</span>{" "}— {leadingParty.fullName}
              </p>
              <p className="text-sm text-gray-300 mt-0.5">
                <strong style={{ color: leadingParty.color }}>{leadingParty.total}</strong> seats
                {leadingParty.total >= summary.majority && (
                  <span className="ml-2 text-green-400 font-semibold">· Majority secured</span>
                )}
              </p>
            </div>
          </div>
          {allianceBadges.map((a) => (
            <div key={a.label} className="rounded-xl p-4 border flex flex-col justify-center items-center"
              style={{ backgroundColor: a.color + "11", borderColor: a.color + "44" }}>
              <span className="text-4xl font-bold" style={{ color: a.color }}>{a.seats}</span>
              <span className="text-sm text-gray-300 mt-1">{a.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">seats</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Party Tally</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.parties.filter((p) => p.total > 0).map((party) => (
              <PartyCard key={party.party} party={party} majority={summary.majority} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Seat Distribution</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <PartySeatChart parties={summary.parties} />
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/pondicherry2026/results"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors border border-gray-700">
          View all 30 constituency results <span aria-hidden>→</span>
        </Link>
      </div>
    </>
  );
}

export default function PondicherryHomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-64 text-gray-500">Loading results...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
