"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PartySummary } from "@/lib/types";

interface Props {
  parties: PartySummary[];
}

export default function PartySeatChart({ parties }: Props) {
  const top = parties.filter((p) => p.total > 0).slice(0, 8);
  const othersTotal = parties
    .filter((p) => p.total > 0)
    .slice(8)
    .reduce((s, p) => s + p.total, 0);

  const data = [
    ...top.map((p) => ({ name: p.party, value: p.total, color: p.color })),
    ...(othersTotal > 0
      ? [{ name: "Others", value: othersTotal, color: "#4B5563" }]
      : []),
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name} ${value}`}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #374151",
            borderRadius: 8,
            color: "#F9FAFB",
          }}
          formatter={(value, name) => [`${value} seats`, name as string]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#9CA3AF", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
