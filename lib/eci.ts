import * as cheerio from "cheerio";
import { existsSync, readFileSync } from "fs";
import path from "path";
import type {
  Constituency,
  PartySummary,
  SummaryData,
  ConstituencyDetail,
  CandidateResult,
} from "./types";
import {
  ECI_BASE,
  PARTY_FULL_NAMES,
  PARTY_COLORS,
  ALLIANCES,
} from "./constants";

// Reverse map: full name → abbreviation
const FULL_TO_ABBR: Map<string, string> = new Map(
  Object.entries(PARTY_FULL_NAMES).map(([abbr, full]) => [
    full.toLowerCase(),
    abbr,
  ])
);

function resolveAbbr(fullName: string): string {
  const key = fullName.toLowerCase().trim();
  return FULL_TO_ABBR.get(key) ?? abbreviate(fullName);
}

function abbreviate(name: string): string {
  // Try known partials
  for (const [full, abbr] of FULL_TO_ABBR.entries()) {
    if (key_matches(full, name)) return abbr;
  }
  // Fallback: first letters of each word
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 6);
}

function key_matches(known: string, raw: string): boolean {
  const r = raw.toLowerCase().trim();
  return r.includes(known.slice(0, 12)) || known.includes(r.slice(0, 12));
}

function getDistrict(acNo: number): string {
  const map: [number, number, string][] = [
    [1, 6, "Tiruvallur"],
    [7, 21, "Chennai"],
    [22, 28, "Kanchipuram"],
    [29, 36, "Chengalpattu"],
    [37, 46, "Vellore"],
    [47, 53, "Ranipet"],
    [54, 63, "Tiruvannamalai"],
    [64, 72, "Villupuram"],
    [73, 78, "Kallakurichi"],
    [79, 87, "Salem"],
    [88, 94, "Namakkal"],
    [95, 102, "Erode"],
    [103, 105, "The Nilgiris"],
    [106, 116, "Coimbatore"],
    [117, 122, "Tiruppur"],
    [123, 130, "Dindigul"],
    [131, 135, "Karur"],
    [136, 142, "Tiruchirappalli"],
    [143, 145, "Perambalur"],
    [146, 149, "Ariyalur"],
    [150, 156, "Cuddalore"],
    [157, 163, "Nagapattinam"],
    [164, 169, "Tiruvarur"],
    [170, 176, "Thanjavur"],
    [177, 183, "Pudukkottai"],
    [184, 189, "Sivaganga"],
    [190, 198, "Madurai"],
    [199, 203, "Theni"],
    [204, 211, "Virudhunagar"],
    [212, 218, "Ramanathapuram"],
    [219, 223, "Thoothukudi"],
    [224, 231, "Tirunelveli"],
    [232, 234, "Kanniyakumari"],
  ];
  for (const [start, end, district] of map) {
    if (acNo >= start && acNo <= end) return district;
  }
  return "Tamil Nadu";
}

// ---------------------------------------------------------------------------
// Summary — parse chartwiseresult-S22.htm for party totals
// ---------------------------------------------------------------------------
const REVALIDATE = 60;
const GITHUB_RAW =
  "https://raw.githubusercontent.com/saikishoretv/tnla-2026/main/data";

function readLocalJson<T>(filename: string): T | null {
  try {
    const p = path.join(process.cwd(), "data", filename);
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf-8")) as T;
  } catch {}
  return null;
}

export async function fetchSummary(): Promise<SummaryData> {
  // 1. Try deployed data file (populated by GitHub Actions)
  const localData = readLocalJson<SummaryData>("summary.json");
  if (localData?.parties?.length) return localData;

  // 2. Try GitHub raw URL (updated by Actions without triggering Vercel redeploy)
  try {
    const ghRes = await fetch(`${GITHUB_RAW}/summary.json`, {
      next: { revalidate: REVALIDATE },
    });
    if (ghRes.ok) {
      const data = (await ghRes.json()) as SummaryData;
      if (data?.parties?.length) return data;
    }
  } catch (e) {
    console.error("[eci] github raw fetch failed:", e);
  }

  // 3. Fallback: direct ECI fetch
  const [chartRes, stateRes] = await Promise.all([
    fetch(`${ECI_BASE}/chartwiseresult-S22.htm`, { next: { revalidate: REVALIDATE } }),
    fetch(`${ECI_BASE}/statewiseS221.htm`, { next: { revalidate: REVALIDATE } }),
  ]);
  if (!chartRes.ok) console.error(`[eci] chartwiseresult: ${chartRes.status}`);
  if (!stateRes.ok) console.error(`[eci] statewiseS221: ${stateRes.status}`);
  const [chartHtml, stateHtml] = await Promise.all([
    chartRes.text(),
    stateRes.text(),
  ]);

  // Extract party names + seat counts from JavaScript vars in chartwiseresult
  const xMatch = chartHtml.match(/var xValues\s*=\s*\[([^\]]*)\]/);
  const yMatch = chartHtml.match(/var yValues\s*=\s*\[([^\]]*)\]/);

  const partyMap = new Map<string, { won: number; leading: number; trailing: number }>();

  if (xMatch && yMatch) {
    const nameRe = /'([^']+)'/g;
    const names: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = nameRe.exec(xMatch[1])) !== null) names.push(m[1]);
    const counts = yMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    names.forEach((name, i) => {
      const abbr = resolveAbbr(name);
      partyMap.set(abbr, { won: 0, leading: counts[i] ?? 0, trailing: 0 });
    });
  }

  // Extract won/leading/trailing per party from statewise tooltips
  const $s = cheerio.load(stateHtml);
  $s("table tbody tr").each((_, row) => {
    // Col [3] = leading party cell with nested table + tooltip
    const cells = $s(row).children("td");
    if (cells.length < 4) return;

    const partyCell = cells.eq(3);
    const nestedTds = partyCell.find("table").first().children("tbody").children("tr").children("td");
    const partyFullName = nestedTds.first().text().trim();
    if (!partyFullName) return;

    const abbr = resolveAbbr(partyFullName);

    // Extract tooltip data: Leading In, Won In, Trailing In
    const tooltipRows = partyCell.find(".tooltip table tbody tr");
    let leading = 0, won = 0, trailing = 0;
    tooltipRows.each((_, tr) => {
      const tds = $s(tr).find("td");
      const label = tds.eq(0).text().trim().toLowerCase();
      const val = parseInt(tds.eq(2).text().trim()) || 0;
      if (label.includes("leading")) leading = val;
      else if (label.includes("won")) won = val;
      else if (label.includes("trailing")) trailing = val;
    });

    if ((leading > 0 || won > 0) && !partyMap.has(abbr)) {
      partyMap.set(abbr, { won, leading, trailing });
    } else if (partyMap.has(abbr)) {
      // Update with won/leading split from tooltip (more accurate)
      const existing = partyMap.get(abbr)!;
      if (existing.won === 0 && won > 0) {
        partyMap.set(abbr, { won, leading, trailing });
      }
    }
  });

  const bodyText = $s("body").text();
  const lastUpdated =
    bodyText.match(/Last Updated[:\s]+([^\n]+)/i)?.[1]?.trim() ?? "";
  const statusLine =
    bodyText.match(/Status Known For ([^\n]+)/i)?.[1]?.trim() ?? "";

  const parties: PartySummary[] = Array.from(partyMap.entries())
    .filter(([, v]) => v.leading + v.won > 0)
    .map(([abbr, v]) => ({
      party: abbr,
      fullName: PARTY_FULL_NAMES[abbr] ?? abbr,
      won: v.won,
      leading: v.leading,
      trailing: v.trailing,
      total: v.won + v.leading,
      color: PARTY_COLORS[abbr] ?? "#6B7280",
      alliance: ALLIANCES[abbr] ?? "Others",
    }))
    .sort((a, b) => b.total - a.total);

  return {
    parties,
    total: 234,
    majority: 118,
    lastUpdated,
    statusLine,
  };
}

// ---------------------------------------------------------------------------
// All constituencies — parse all 12 statewise pages
// ---------------------------------------------------------------------------
export async function fetchAllConstituencies(): Promise<Constituency[]> {
  // 1. Try deployed data file
  const localData = readLocalJson<Constituency[]>("constituencies.json");
  if (localData?.length) return localData;

  // 2. Try GitHub raw URL
  try {
    const ghRes = await fetch(`${GITHUB_RAW}/constituencies.json`, {
      next: { revalidate: REVALIDATE },
    });
    if (ghRes.ok) {
      const data = (await ghRes.json()) as Constituency[];
      if (data?.length) return data;
    }
  } catch (e) {
    console.error("[eci] github raw fetch failed:", e);
  }

  // 3. Fallback: direct ECI fetch
  const pages = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const res = await fetch(`${ECI_BASE}/statewiseS22${i + 1}.htm`, { next: { revalidate: REVALIDATE } });
      if (!res.ok) console.error(`[eci] statewiseS22${i + 1}: ${res.status}`);
      return res.text();
    })
  );

  const constituencies: Constituency[] = [];
  const seen = new Set<number>();

  for (const html of pages) {
    const $ = cheerio.load(html);

    $("table tbody tr").each((_, row) => {
      const cells = $(row).children("td");
      if (cells.length < 7) return;

      const name = cells.eq(0).text().trim();
      const acNo = parseInt(cells.eq(1).text().trim());

      if (!name || isNaN(acNo) || acNo < 1 || acNo > 234) return;
      if (seen.has(acNo)) return;
      seen.add(acNo);

      const leadCandidate = cells.eq(2).text().trim();

      // Leading party: first td of nested table inside cell 3
      const leadPartyFull = cells
        .eq(3)
        .find("table")
        .first()
        .children("tbody")
        .children("tr")
        .children("td")
        .first()
        .text()
        .trim();

      const trailCandidate = cells.eq(4).text().trim();

      const trailPartyFull = cells
        .eq(5)
        .find("table")
        .first()
        .children("tbody")
        .children("tr")
        .children("td")
        .first()
        .text()
        .trim();

      const margin = parseInt(cells.eq(6).text().replace(/,/g, "").trim()) || 0;
      const statusText = cells.eq(8).text().trim();

      constituencies.push({
        id: acNo,
        name,
        district: getDistrict(acNo),
        leadingCandidate: leadCandidate,
        leadingParty: resolveAbbr(leadPartyFull) || leadPartyFull,
        trailingCandidate: trailCandidate,
        trailingParty: resolveAbbr(trailPartyFull) || trailPartyFull,
        margin,
        status: statusText.toLowerCase().includes("won") ? "Won" : "Leading",
      });
    });
  }

  return constituencies.sort((a, b) => a.id - b.id);
}

// ---------------------------------------------------------------------------
// Constituency detail
// ---------------------------------------------------------------------------
export async function fetchConstituencyDetail(
  id: number
): Promise<ConstituencyDetail> {
  // 1. Try deployed data file
  const localData = readLocalJson<ConstituencyDetail>(`constituency/${id}.json`);
  if (localData?.candidates?.length) return localData;

  // 2. Try GitHub raw URL
  try {
    const ghRes = await fetch(`${GITHUB_RAW}/constituency/${id}.json`, {
      next: { revalidate: REVALIDATE },
    });
    if (ghRes.ok) {
      const data = (await ghRes.json()) as ConstituencyDetail;
      if (data?.candidates?.length) return data;
    }
  } catch {}

  // 3. Fallback: direct ECI fetch
  const res = await fetch(`${ECI_BASE}/ConstituencywiseS22${id}.htm`, { next: { revalidate: REVALIDATE } });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Extract name from H2: "Assembly Constituency N - NAME (State)"
  const h2Text = $("h2").text();
  const nameMatch = h2Text.match(/Assembly Constituency\s+\d+\s*[-–]\s*([^(]+)/i);
  const name = nameMatch?.[1]?.trim() ?? `Constituency ${id}`;

  const candidates: CandidateResult[] = [];

  // The candidate table has: Serial#, Candidate, Party, EVM Votes, Postal Votes, Total, %
  $("table tbody tr").each((_, row) => {
    const cells = $(row).children("td");
    if (cells.length < 5) return;

    const col0 = cells.eq(0).text().trim(); // Serial or rank
    const col1 = cells.eq(1).text().trim(); // Candidate name
    const col2 = cells.eq(2).text().trim(); // Party
    const col3 = cells.eq(3).text().replace(/,/g, "").trim(); // EVM votes
    const col4 = cells.eq(4).text().replace(/,/g, "").trim(); // Postal votes
    const col5 = cells.length > 5 ? cells.eq(5).text().replace(/,/g, "").trim() : ""; // Total
    const col6 = cells.length > 6 ? cells.eq(6).text().trim() : ""; // %

    if (!col1 || !col2 || /candidate|party|name/i.test(col1)) return;

    const evmVotes = parseInt(col3) || 0;
    const postalVotes = parseInt(col4) || 0;
    const totalVotes = parseInt(col5) || evmVotes + postalVotes;
    const percentage = parseFloat(col6) || 0;

    candidates.push({
      rank: parseInt(col0) || candidates.length + 1,
      name: col1,
      party: resolveAbbr(col2) || col2,
      evmVotes,
      postalVotes,
      totalVotes,
      percentage,
      isLeading: false,
    });
  });

  // Sort by votes descending
  candidates.sort((a, b) => b.totalVotes - a.totalVotes);
  candidates.forEach((c, i) => {
    c.rank = i + 1;
    c.isLeading = i === 0;
  });

  const bodyText = $("body").text();
  const round =
    bodyText.match(/Round\s+(\d+\s+of\s+\d+)/i)?.[1] ??
    bodyText.match(/Round\s+(\d+)/i)?.[1] ??
    "";
  const lastUpdated =
    bodyText.match(/Last Updated[:\s]+([^\n]+)/i)?.[1]?.trim() ?? "";

  return {
    id,
    name,
    district: getDistrict(id),
    candidates,
    totalVotesCounted: candidates.reduce((s, c) => s + c.totalVotes, 0),
    round,
    lastUpdated,
  };
}
