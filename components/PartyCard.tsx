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
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2"
      style={{ borderTopColor: party.color, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-2xl font-bold tabular-nums"
            style={{ color: party.color }}
          >
            {party.total}
          </p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">
            {party.party}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {leader && (
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0"
              style={{ borderColor: party.color }}
            >
              <Image
                src={leader.src}
                alt={leader.name}
                width={40}
                height={40}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}
          <div className="text-right text-xs text-gray-500">
            {party.won > 0 && (
              <p>
                <span className="text-green-400 font-semibold">{party.won}</span>{" "}
                Won
              </p>
            )}
            <p>
              <span className="text-yellow-400 font-semibold">
                {party.leading}
              </span>{" "}
              Leading
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 truncate">{party.fullName}</p>
      <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: party.color }}
        />
      </div>
      <p className="text-xs text-gray-600">{party.alliance}</p>
    </div>
  );
}
