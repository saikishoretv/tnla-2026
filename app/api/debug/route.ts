export const dynamic = "force-dynamic";

export async function GET() {
  const url = "https://results.eci.gov.in/ResultAcGenMay2026/chartwiseresult-S22.htm";
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    const hasXValues = text.includes("xValues");
    const snippet = text.slice(0, 300);
    return Response.json({
      status: res.status,
      ok: res.ok,
      hasXValues,
      snippet,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
