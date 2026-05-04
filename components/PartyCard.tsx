import Image from "next/image";
import type { PartySummary } from "@/lib/types";
import { PARTY_LEADER_IMAGE } from "@/lib/constants";

export default function PartyCard({
  party,
  majority,
}: {
  party: PartySummary;
  majority: number;
}) {
  const pct = Math.min((party.total / majority) * 100, 100);
  const leader = PARTY_LEADER_IMAGE[party.party];

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3"
      style={{ borderTopColor: party.color, borderTopWidth: 3 }}
    >
      {/* Top row: photo + count/abbr + won/leading */}
      <div className="flex items-center gap-3">
        {/* Leader photo */}
        {leader ? (
          <div
            className="w-14 h-14 rounded-full overflow-hidden border-2 shrink-0"
            style={{ borderColor: party.color }}
          >
            <Image
              src={leader.src}
              alt={leader.name}
              width={56}
              height={56}
              className="w-full h-full object-cover object-top"
            />
          </div>
        ) : (
          <div
            className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: party.color + "22", color: party.color }}
          >
            {party.party.slice(0, 2)}
          </div>
        )}

        {/* Seat count + party abbr */}
        <div className="flex-1 min-w-0">
          <p
            className="text-4xl font-bold tabular-nums leading-none"
            style={{ color: party.color }}
          >
            {party.total}
          </p>
          <p className="text-sm text-gray-300 font-semibold mt-1">
            {party.party}
          </p>
        </div>

        {/* Won / Leading */}
        <div className="text-right text-sm shrink-0">
          {party.won > 0 && (
            <p className="leading-snug">
              <span className="text-green-400 font-bold">{party.won}</span>
              <span className="text-gray-400"> Won</span>
            </p>
          )}
          <p className="leading-snug">
            <span className="text-yellow-400 font-bold">{party.leading}</span>
            <span className="text-gray-400"> Leading</span>
          </p>
        </div>
      </div>

      {/* Full name */}
      <p className="text-xs text-gray-500 truncate">{party.fullName}</p>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: party.color }}
        />
      </div>

      {/* Alliance */}
      <p className="text-xs text-gray-600">{party.alliance}</p>
    </div>
  );
}
