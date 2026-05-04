"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { TN_DISTRICTS } from "@/lib/constants";

const PARTIES = ["TVK", "DMK", "ADMK", "INC", "PMK", "BJP", "NTK", "AMMK", "Others"];
const ALLIANCES = ["SPA Alliance", "ADMK+ Alliance", "TVK (Solo)", "NTK (Solo)"];
const STATUSES = ["Won", "Leading"];

export default function ConstituencyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
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

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <input
        type="text"
        placeholder="Search constituency..."
        value={q}
        onChange={(e) => update("q", e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 w-48"
      />

      {/* Party filter */}
      <select
        value={party}
        onChange={(e) => update("party", e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
      >
        <option value="">All Parties</option>
        {PARTIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
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
          <option key={a} value={a}>
            {a}
          </option>
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
          <option key={d} value={d}>
            {d}
          </option>
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
          <option key={s} value={s}>
            {s}
          </option>
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
