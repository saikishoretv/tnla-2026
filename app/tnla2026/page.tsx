import { Suspense } from "react";
import Link from "next/link";
import { fetchSummary } from "@/lib/eci";
import PartyCard from "@/components/PartyCard";
import MajorityTracker from "@/components/MajorityTracker";
import LiveBadge from "@/components/LiveBadge";
import PartySeatChart from "@/components/PartySeatChart";

async function DashboardContent() {
  const summary = await fetchSummary();
  const leadingParty = summary.parties[0];

  return (
    <>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Tamil Nadu Assembly Election 2026
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {summary.statusLine
              ? `Status known for ${summary.statusLine}`
              : "234 Assembly Constituencies"}
          </p>
        </div>
        <LiveBadge lastUpdated={summary.lastUpdated} />
      </div>

      {/* Majority tracker */}
      <div className="mb-6">
        <MajorityTracker
          parties={summary.parties}
          majority={summary.majority}
          total={summary.total}
        />
      </div>

      {/* Leading party banner */}
      {leadingParty && (
        <div
          className="mb-6 rounded-xl p-4 border flex items-center gap-4"
          style={{
            backgroundColor: leadingParty.color + "11",
            borderColor: leadingParty.color + "44",
          }}
        >
          <div
            className="w-1 self-stretch rounded-full"
            style={{ backgroundColor: leadingParty.color }}
          />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
              Currently Leading
            </p>
            <p className="font-semibold text-white">
              <span style={{ color: leadingParty.color }}>
                {leadingParty.party}
              </span>{" "}
              — {leadingParty.fullName}
            </p>
            <p className="text-sm text-gray-300 mt-0.5">
              <strong style={{ color: leadingParty.color }}>
                {leadingParty.total}
              </strong>{" "}
              seats (
              {leadingParty.won > 0 && `${leadingParty.won} won + `}
              {leadingParty.leading} leading)
              {leadingParty.total >= summary.majority && (
                <span className="ml-2 text-green-400 font-semibold">
                  · Majority secured
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Party cards grid + chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Party Tally
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.parties
              .filter((p) => p.total > 0)
              .map((party) => (
                <PartyCard
                  key={party.party}
                  party={party}
                  majority={summary.majority}
                />
              ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Seat Distribution
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <PartySeatChart parties={summary.parties} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/tnla2026/results"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors border border-gray-700"
        >
          View all 234 constituency results
          <span aria-hidden>→</span>
        </Link>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-64 text-gray-500">
          Loading live results...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
