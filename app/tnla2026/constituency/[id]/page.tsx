import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchConstituencyDetail } from "@/lib/eci";
import LiveBadge from "@/components/LiveBadge";
import CandidateVoteChart from "@/components/CandidateVoteChart";
import { PARTY_COLORS, ALLIANCES } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const acNo = parseInt(id);
  if (isNaN(acNo)) return { title: "Constituency" };
  try {
    const detail = await fetchConstituencyDetail(acNo);
    const leader = detail.candidates[0];
    return {
      title: `${detail.name} (AC ${acNo})`,
      description: `TNLA 2026 results for ${detail.name} constituency. ${
        leader
          ? `${leader.name} (${leader.party}) leading with ${leader.totalVotes.toLocaleString("en-IN")} votes.`
          : ""
      }`,
    };
  } catch {
    return { title: `Constituency ${id}` };
  }
}

async function ConstituencyDetailContent({ id }: { id: string }) {
  const acNo = parseInt(id);
  const detail = await fetchConstituencyDetail(acNo);
  const winner = detail.candidates[0];
  const runnerUp = detail.candidates[1];
  const margin = winner && runnerUp ? winner.totalVotes - runnerUp.totalVotes : 0;
  const winnerColor = winner ? (PARTY_COLORS[winner.party] ?? "#6B7280") : "#6B7280";

  return (
    <>
      {/* Back link */}
      <Link
        href="/tnla2026/results"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6"
      >
        ← Back to all results
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-mono">AC {acNo}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{detail.district}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{detail.name}</h1>
          {detail.round && (
            <p className="text-sm text-gray-400 mt-1">Round {detail.round}</p>
          )}
        </div>
        <LiveBadge lastUpdated={detail.lastUpdated} />
      </div>

      {/* Winner card */}
      {winner && (
        <div
          className="rounded-xl p-5 border mb-6"
          style={{
            backgroundColor: winnerColor + "0f",
            borderColor: winnerColor + "44",
          }}
        >
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Currently Leading
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-white">{winner.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    backgroundColor: winnerColor + "22",
                    color: winnerColor,
                    border: `1px solid ${winnerColor}44`,
                  }}
                >
                  {winner.party}
                </span>
                <span className="text-xs text-gray-500">
                  {ALLIANCES[winner.party] ?? ""}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums" style={{ color: winnerColor }}>
                {winner.totalVotes.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400">votes ({winner.percentage}%)</p>
            </div>
          </div>
          {margin > 0 && runnerUp && (
            <p className="text-sm text-gray-300 mt-3">
              Leading by{" "}
              <strong className="text-white">
                {margin.toLocaleString("en-IN")}
              </strong>{" "}
              votes over {runnerUp.name} ({runnerUp.party})
            </p>
          )}
        </div>
      )}

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Vote Distribution
          </h2>
          <CandidateVoteChart candidates={detail.candidates} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300">
              Candidate-wise Results
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Total votes counted:{" "}
              {detail.totalVotesCounted.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/60">
                  <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                    Candidate
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">
                    Party
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">
                    Votes
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {detail.candidates.map((c, i) => {
                  const color = PARTY_COLORS[c.party] ?? "#6B7280";
                  return (
                    <tr
                      key={i}
                      className={i === 0 ? "bg-gray-800/30" : ""}
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-gray-200 font-medium text-xs">
                          {c.name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: color + "22",
                            color,
                          }}
                        >
                          {c.party}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-300 text-xs">
                        {c.totalVotes.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-400 text-xs">
                        {c.percentage > 0 ? `${c.percentage}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ConstituencyPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-64 text-gray-500">
          Loading constituency results...
        </div>
      }
    >
      <ConstituencyDetailInner params={params} />
    </Suspense>
  );
}

async function ConstituencyDetailInner({ params }: Props) {
  const { id } = await params;
  return <ConstituencyDetailContent id={id} />;
}
