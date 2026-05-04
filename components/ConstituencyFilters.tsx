"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { TN_DISTRICTS, PARTY_COLORS } from "@/lib/constants";
import type { Constituency } from "@/lib/types";

const PARTIES = ["TVK", "DMK", "AIADMK", "INC", "PMK", "BJP", "NTK", "AMMK"];
const ALLIANCES = ["SPA Alliance", "ADMK+ Alliance", "TVK (Solo)", "NTK (Solo)"];
const STATUSES = ["Won", "Leading"];

export default function ConstituencyFilters({
  constituencies,
}: {
  constituencies: Constituency[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const q = searchParams.get("q") ?? "";
  const party = searchParams.get("party") ?? "";
  const district = searchParams.get("district") ?? "";
  const alliance = searchParams.get("alliance") ?? "";
  const status = searchParams.get("status") ?? "";

  const suggestions =
    q.length >= 1
      ? constituencies
          .filter(
            (c) =>
              c.name.toLowerCase().includes(q.toLowerCase()) ||
              c.leadingCandidate.toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, 8)
      : [];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search with suggestions */}
      <div ref={wrapperRef} className="relative">
        <input
          type="text"
          placeholder="Search constituency or candidate..."
          value={q}
          onChange={(e) => { update("q", e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 w-64"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {suggestions.map((c) => {
              const color = PARTY_COLORS[c.leadingParty] ?? "#6B7280";
              return (
                <li key={c.id}>
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-800 flex items-center justify-between gap-3 border-b border-gray-800/60 last:border-0"
                    onMouseDown={() => {
                      setOpen(false);
                      router.push(`/tnla2026/constituency/${c.id}`);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-100 font-medium truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.leadingCandidate}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ color, backgroundColor: color + "22" }}
                      >
                        {c.leadingParty}
                      </span>
                      <span className="text-xs text-gray-600">AC {c.id}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Party filter */}
      <select
        value={party}
        onChange={(e) => update("party", e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        <option value="">All Parties</option>
        {PARTIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Alliance filter */}
      <select
        value={alliance}
        onChange={(e) => update("alliance", e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        <option value="">All Alliances</option>
        {ALLIANCES.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {/* District filter */}
      <select
        value={district}
        onChange={(e) => update("district", e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        <option value="">All Districts</option>
        {TN_DISTRICTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => update("status", e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Clear */}
      {(q || party || district || alliance || status) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-gray-400 hover:text-gray-200 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
