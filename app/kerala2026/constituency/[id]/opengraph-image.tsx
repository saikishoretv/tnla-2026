import { ImageResponse } from "next/og";
import { fetchKeralaConstituencyDetail } from "@/lib/eci";
import { PARTY_COLORS } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const acNo = parseInt(id);
  const detail = await fetchKeralaConstituencyDetail(acNo);
  const winner = detail.candidates[0];
  const runnerUp = detail.candidates[1];
  const margin = winner && runnerUp ? winner.totalVotes - runnerUp.totalVotes : 0;
  const color = winner ? (PARTY_COLORS[winner.party] ?? "#6B7280") : "#6B7280";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#030712",
          display: "flex",
          flexDirection: "column",
          padding: "60px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>☝️</span>
            <span style={{ color: "#9CA3AF", fontSize: 18 }}>allelectoralresults.info</span>
          </div>
          <div style={{ color: "#9CA3AF", fontSize: 16, display: "flex", gap: 12 }}>
            <span style={{ color: "#6B7280" }}>AC {acNo}</span>
            <span style={{ color: "#374151" }}>·</span>
            <span>{detail.district}</span>
            <span style={{ color: "#374151" }}>·</span>
            <span>KLA 2026</span>
          </div>
        </div>

        {/* Constituency name */}
        <div style={{ color: "white", fontSize: 56, fontWeight: 800, marginBottom: 32, letterSpacing: "-1px" }}>
          {detail.name}
        </div>

        {/* Winner card */}
        {winner && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: color + "18",
              border: `2px solid ${color}44`,
              borderRadius: 20,
              padding: "32px 40px",
              marginBottom: 32,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  backgroundColor: color + "33",
                  color,
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: 8,
                  width: "fit-content",
                  display: "flex",
                }}
              >
                {winner.party} · Winner
              </div>
              <div style={{ color: "white", fontSize: 38, fontWeight: 700 }}>{winner.name}</div>
              {margin > 0 && runnerUp && (
                <div style={{ color: "#9CA3AF", fontSize: 20 }}>
                  Won by {margin.toLocaleString("en-IN")} votes over {runnerUp.name}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ color, fontSize: 52, fontWeight: 800 }}>
                {winner.totalVotes.toLocaleString("en-IN")}
              </div>
              <div style={{ color: "#6B7280", fontSize: 18 }}>votes · {winner.percentage}%</div>
            </div>
          </div>
        )}

        {/* Color bar */}
        <div style={{ height: 6, borderRadius: 4, backgroundColor: color, width: `${winner?.percentage ?? 50}%` }} />
      </div>
    ),
    { ...size }
  );
}
