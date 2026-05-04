import { ImageResponse } from "next/og";
import { fetchAssamSummary } from "@/lib/eci";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const summary = await fetchAssamSummary();
  const top3 = summary.parties.slice(0, 3);

  const allianceTotals: Record<string, number> = {};
  for (const p of summary.parties) {
    allianceTotals[p.alliance] = (allianceTotals[p.alliance] ?? 0) + p.total;
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <span style={{ fontSize: 28 }}>☝️</span>
          <span style={{ color: "#9CA3AF", fontSize: 18 }}>allelectoralresults.info</span>
        </div>

        <div style={{ color: "white", fontSize: 44, fontWeight: 800, marginBottom: 8, letterSpacing: "-1px" }}>
          Assam Assembly Election 2026
        </div>
        <div style={{ color: "#6B7280", fontSize: 20, marginBottom: 48 }}>
          126 constituencies · Majority: 64
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 48 }}>
          {top3.map((p, i) => (
            <div
              key={p.party}
              style={{
                flex: 1,
                backgroundColor: p.color + "18",
                border: `2px solid ${p.color}44`,
                borderRadius: 16,
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ color: p.color, fontSize: 14, fontWeight: 600 }}>{i === 0 ? "🏆 Winner" : `#${i + 1}`}</div>
              <div style={{ color: p.color, fontSize: 48, fontWeight: 800 }}>{p.total}</div>
              <div style={{ color: "white", fontSize: 22, fontWeight: 700 }}>{p.party}</div>
              <div style={{ color: "#9CA3AF", fontSize: 14 }}>{p.alliance}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "NDA", color: "#F97316" },
            { label: "INDIA Alliance", color: "#3B82F6" },
            { label: "Others", color: "#6B7280" },
          ].map((a) => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: a.color }} />
              <span style={{ color: "#9CA3AF", fontSize: 16 }}>{a.label}: </span>
              <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>{allianceTotals[a.label] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
