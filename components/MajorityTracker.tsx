import type { PartySummary } from "@/lib/types";
import { ALLIANCE_COLORS } from "@/lib/constants";

function groupByAlliance(parties: PartySummary[]) {
  const map = new Map<string, number>();
  for (const p of parties) {
    map.set(p.alliance, (map.get(p.alliance) ?? 0) + p.total);
  }
  return Array.from(map.entries())
    .map(([alliance, seats]) => ({ alliance, seats }))
    .sort((a, b) => b.seats - a.seats);
}

export default function MajorityTracker({
  parties,
  majority,
  total,
}: {
  parties: PartySummary[];
  majority: number;
  total: number;
}) {
  const alliances = groupByAlliance(parties);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Majority Tracker
        </h2>
        <span className="text-xs text-gray-500">
          {majority}/{total} needed
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex w-full h-6 rounded-lg overflow-hidden gap-px bg-gray-800 mb-4">
        {alliances.map(({ alliance, seats }) => (
          <div
            key={alliance}
            className="h-full transition-all duration-700"
            style={{
              width: `${(seats / total) * 100}%`,
              backgroundColor:
                ALLIANCE_COLORS[alliance] ?? "#6B7280",
            }}
            title={`${alliance}: ${seats} seats`}
          />
        ))}
      </div>

      {/* Majority line indicator */}
      <div className="relative mb-4">
        <div
          className="absolute top-0 w-px h-3 bg-white/60"
          style={{ left: `${(majority / total) * 100}%` }}
        />
        <p
          className="absolute text-xs text-white/60 -translate-x-1/2 top-4"
          style={{ left: `${(majority / total) * 100}%` }}
        >
          {majority}
        </p>
      </div>

      {/* Alliance legend */}
      <div className="mt-8 flex flex-wrap gap-3">
        {alliances.map(({ alliance, seats }) => (
          <div key={alliance} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: ALLIANCE_COLORS[alliance] ?? "#6B7280",
              }}
            />
            <span className="text-xs text-gray-400">
              {alliance}:{" "}
              <strong className="text-gray-200">{seats}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
