"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CandidateResult } from "@/lib/types";
import { PARTY_COLORS } from "@/lib/constants";

export default function CandidateVoteChart({
  candidates,
}: {
  candidates: CandidateResult[];
}) {
  const top = candidates.slice(0, 8);
  const data = top.map((c) => ({
    name: c.name.split(" ").slice(0, 2).join(" "),
    party: c.party,
    votes: c.totalVotes,
    pct: c.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis
          type="number"
          tick={{ fill: "#6B7280", fontSize: 11 }}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          width={90}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #374151",
            borderRadius: 8,
            color: "#F9FAFB",
          }}
          formatter={(value, _name, props) => [
            `${Number(value).toLocaleString("en-IN")} (${(props.payload as { pct: number }).pct}%)`,
            (props.payload as { party: string }).party,
          ]}
          labelStyle={{ color: "#D1D5DB" }}
        />
        <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={PARTY_COLORS[entry.party] ?? "#4B5563"}
              opacity={i === 0 ? 1 : 0.6}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
