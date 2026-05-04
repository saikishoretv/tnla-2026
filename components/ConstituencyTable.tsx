import Link from "next/link";
import type { Constituency } from "@/lib/types";
import { PARTY_COLORS, ALLIANCES } from "@/lib/constants";

interface Props {
  constituencies: Constituency[];
  page: number;
  pageSize?: number;
  basePath?: string;
}

const PAGE_SIZE = 30;

function StatusBadge({ status }: { status: Constituency["status"] }) {
  if (status === "Won")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
        Won
      </span>
    );
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/40 text-yellow-400 border border-yellow-800">
      Leading
    </span>
  );
}

export default function ConstituencyTable({
  constituencies,
  page,
  pageSize = PAGE_SIZE,
  basePath = "/tnla2026",
}: Props) {
  const start = (page - 1) * pageSize;
  const slice = constituencies.slice(start, start + pageSize);
  const totalPages = Math.ceil(constituencies.length / pageSize);

  return (
    <div>
      <div className="text-xs text-gray-500 mb-3">
        Showing {start + 1}–{Math.min(start + pageSize, constituencies.length)}{" "}
        of {constituencies.length} constituencies
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/80">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Constituency
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                District
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Leading
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Trailing
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Margin
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {slice.map((c) => {
              const color = PARTY_COLORS[c.leadingParty] ?? "#6B7280";
              const alliance = ALLIANCES[c.leadingParty] ?? "Others";
              return (
                <tr
                  key={c.id}
                  className="hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`${basePath}/constituency/${c.id}`}
                      className="font-medium text-gray-100 hover:text-white hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">
                    {c.district}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-xs font-bold mr-1.5"
                        style={{
                          backgroundColor: color + "22",
                          color,
                          border: `1px solid ${color}44`,
                        }}
                      >
                        {c.leadingParty}
                      </span>
                      <span className="text-gray-300 text-xs">
                        {c.leadingCandidate}
                      </span>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {alliance}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                    {c.trailingCandidate && (
                      <>
                        <span>{c.trailingParty}</span>{" "}
                        <span>{c.trailingCandidate}</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-300 text-xs hidden sm:table-cell">
                    {c.margin > 0 ? c.margin.toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                p === page
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
