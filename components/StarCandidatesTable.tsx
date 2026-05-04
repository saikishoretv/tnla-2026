import Link from "next/link";
import { fetchAllStarResults } from "@/lib/fetchStarResults";
import { PARTY_COLORS } from "@/lib/constants";

function StatusPill({ status }: { status: "Leading" | "Trailing" | "Unknown" }) {
  if (status === "Leading")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900/50 text-green-400 border border-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        Leading
      </span>
    );
  if (status === "Trailing")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-900/40 text-red-400 border border-red-900">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        Trailing
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs text-gray-500 bg-gray-800 border border-gray-700">
      —
    </span>
  );
}

export default async function StarCandidatesTable() {
  const results = await fetchAllStarResults();

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/80">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Candidate
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Constituency
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Votes
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Margin
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                vs. Opponent
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {results.map((r) => {
              const color = PARTY_COLORS[r.meta.party] ?? "#6B7280";
              const opponent =
                r.status === "Trailing"
                  ? r.leader
                  : r.candidate?.isLeading
                  ? (r.leader?.rank === 1 ? null : null) // candidate IS leader, show runner-up
                  : null;
              const runnerUp =
                r.status === "Leading"
                  ? r.candidate && r.candidate.rank === 1
                    ? results
                        .find((x) => x.acId === r.acId)
                        ?.candidate // this is fine since we have it
                    : null
                  : null;

              // If leading, runner-up is index 1 of that constituency's candidates
              // We don't have that here easily; show leader's opponent from API
              const opponentName =
                r.status === "Trailing"
                  ? r.leader?.name ?? "—"
                  : "—";
              const opponentParty =
                r.status === "Trailing" ? r.leader?.party ?? "" : "";

              return (
                <tr
                  key={r.meta.acId}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  {/* Candidate */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 w-1 self-stretch rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="font-semibold text-gray-100 text-sm leading-tight">
                          {r.meta.displayName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.meta.role}
                        </p>
                        <span
                          className="inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: color + "22",
                            color,
                            border: `1px solid ${color}44`,
                          }}
                        >
                          {r.meta.party}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Constituency */}
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <Link
                      href={`/constituency/${r.acId}`}
                      className="text-gray-300 hover:text-white hover:underline font-medium text-xs"
                    >
                      {r.constituencyName}
                    </Link>
                    <p className="text-xs text-gray-600 mt-0.5">AC {r.acId}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <StatusPill status={r.status} />
                  </td>

                  {/* Votes */}
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    {r.candidate ? (
                      <div>
                        <p className="font-mono text-gray-200 text-sm">
                          {r.candidate.totalVotes.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.candidate.percentage}%
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>

                  {/* Margin */}
                  <td className="px-4 py-3.5 text-right">
                    {r.margin > 0 ? (
                      <span
                        className={`font-mono text-sm font-semibold ${
                          r.status === "Leading"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {r.status === "Trailing" ? "−" : "+"}
                        {r.margin.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>

                  {/* Opponent */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {r.status === "Trailing" && opponentName !== "—" ? (
                      <div>
                        <p className="text-xs text-gray-300">{opponentName}</p>
                        {opponentParty && (
                          <span
                            className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold"
                            style={{
                              backgroundColor:
                                (PARTY_COLORS[opponentParty] ?? "#6B7280") + "22",
                              color: PARTY_COLORS[opponentParty] ?? "#6B7280",
                              border: `1px solid ${(PARTY_COLORS[opponentParty] ?? "#6B7280")}44`,
                            }}
                          >
                            {opponentParty}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
