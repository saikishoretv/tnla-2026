/**
 * Fetches West Bengal 2026 election data and writes JSON files to data/westbengal/
 * Run from your laptop: node scripts/fetch-westbengal.mjs
 */
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";

const ECI_BASE = "https://results.eci.gov.in/ResultAcGenMay2026";
const STATE = "S25";
const TOTAL_PAGES = 15;
const TOTAL_SEATS = 294;
const MAJORITY = 148;

const PARTY_FULL_NAMES = {
  BJP: "Bharatiya Janata Party",
  AITC: "All India Trinamool Congress",
  TMC: "All India Trinamool Congress",
  INC: "Indian National Congress",
  "CPI(M)": "Communist Party of India (Marxist)",
  CPI: "Communist Party of India",
  AISF: "All India Secular Front",
  AJUP: "Aam Janata Unnayan party",
  RSP: "Revolutionary Socialist Party",
  FB: "All India Forward Bloc",
  JD: "Janata Dal",
  NCP: "Nationalist Congress Party",
  IND: "Independent",
};

const PARTY_COLORS = {
  BJP: "#F97316",
  AITC: "#10B981",
  TMC: "#10B981",
  INC: "#3B82F6",
  "CPI(M)": "#EF4444",
  CPI: "#F87171",
  AISF: "#8B5CF6",
  AJUP: "#06B6D4",
  RSP: "#EF4444",
  FB: "#DC2626",
  IND: "#6B7280",
};

const ALLIANCES = {
  BJP: "NDA",
  AITC: "TMC Alliance",
  TMC: "TMC Alliance",
  INC: "Left+Congress",
  "CPI(M)": "Left+Congress",
  CPI: "Left+Congress",
  AISF: "Left+Congress",
  RSP: "Left+Congress",
  FB: "Left+Congress",
  AJUP: "Others",
};

const FULL_TO_ABBR = new Map(
  Object.entries(PARTY_FULL_NAMES).map(([abbr, full]) => [full.toLowerCase(), abbr])
);

function resolveAbbr(fullName) {
  const key = fullName.toLowerCase().trim();
  if (FULL_TO_ABBR.has(key)) return FULL_TO_ABBR.get(key);
  for (const [full, abbr] of FULL_TO_ABBR.entries()) {
    if (key.includes(full.slice(0, 12)) || full.includes(key.slice(0, 12))) return abbr;
  }
  // Special case: Trinamool
  if (key.includes("trinamool")) return "AITC";
  if (key.includes("secular front")) return "AISF";
  if (key.includes("aam janata")) return "AJUP";
  return fullName.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 6);
}

function getDistrict(acNo) {
  const map = [
    [1, 9, "Cooch Behar"],
    [10, 14, "Alipurduar"],
    [15, 21, "Jalpaiguri"],
    [22, 26, "Darjeeling"],
    [27, 29, "Kalimpong"],
    [30, 38, "Uttar Dinajpur"],
    [39, 46, "Dakshin Dinajpur"],
    [47, 59, "Malda"],
    [60, 81, "Murshidabad"],
    [82, 94, "Birbhum"],
    [95, 129, "North 24 Parganas"],
    [130, 145, "Kolkata"],
    [146, 161, "Howrah"],
    [162, 179, "Hooghly"],
    [180, 210, "South 24 Parganas"],
    [211, 230, "Purba Medinipur"],
    [231, 248, "Paschim Medinipur"],
    [249, 256, "Jhargram"],
    [257, 268, "Bankura"],
    [269, 277, "Purulia"],
    [278, 285, "Paschim Bardhaman"],
    [286, 294, "Purba Bardhaman"],
  ];
  for (const [start, end, district] of map) {
    if (acNo >= start && acNo <= end) return district;
  }
  return "West Bengal";
}

async function fetchSummary() {
  const [chartRes, stateRes] = await Promise.all([
    fetch(`${ECI_BASE}/chartwiseresult-${STATE}.htm`),
    fetch(`${ECI_BASE}/statewise${STATE}1.htm`),
  ]);

  const [chartHtml, stateHtml] = await Promise.all([chartRes.text(), stateRes.text()]);

  const xMatch = chartHtml.match(/var xValues\s*=\s*\[([^\]]*)\]/);
  const yMatch = chartHtml.match(/var yValues\s*=\s*\[([^\]]*)\]/);

  const partyMap = new Map();

  if (xMatch && yMatch) {
    const nameRe = /'([^']+)'/g;
    const names = [];
    let m;
    while ((m = nameRe.exec(xMatch[1])) !== null) names.push(m[1]);
    const counts = yMatch[1].split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    names.forEach((name, i) => {
      const abbr = resolveAbbr(name);
      partyMap.set(abbr, { won: 0, leading: counts[i] ?? 0, trailing: 0 });
    });
  }

  const $s = cheerio.load(stateHtml);
  const bodyText = $s("body").text();
  const lastUpdated = bodyText.match(/Last Updated[:\s]+([^\n]+)/i)?.[1]?.trim() ?? "";
  const statusLine = bodyText.match(/Status Known For ([^\n]+)/i)?.[1]?.trim() ?? "";

  const parties = Array.from(partyMap.entries())
    .filter(([, v]) => v.leading + v.won > 0)
    .map(([abbr, v]) => ({
      party: abbr,
      fullName: PARTY_FULL_NAMES[abbr] ?? abbr,
      won: v.won + v.leading,
      leading: 0,
      trailing: v.trailing,
      total: v.won + v.leading,
      color: PARTY_COLORS[abbr] ?? "#6B7280",
      alliance: ALLIANCES[abbr] ?? "Others",
    }))
    .sort((a, b) => b.total - a.total);

  return { parties, total: TOTAL_SEATS, majority: MAJORITY, lastUpdated, statusLine };
}

async function fetchAllConstituencies() {
  const pages = await Promise.all(
    Array.from({ length: TOTAL_PAGES }, async (_, i) => {
      const res = await fetch(`${ECI_BASE}/statewise${STATE}${i + 1}.htm`);
      if (!res.ok) { console.error(`statewise${STATE}${i + 1}: ${res.status}`); return ""; }
      return res.text();
    })
  );

  const constituencies = [];
  const seen = new Set();

  for (const html of pages) {
    if (!html) continue;
    const $ = cheerio.load(html);
    $("table tbody tr").each((_, row) => {
      const cells = $(row).children("td");
      if (cells.length < 7) return;
      const name = cells.eq(0).text().trim();
      const acNo = parseInt(cells.eq(1).text().trim());
      if (!name || isNaN(acNo) || acNo < 1 || acNo > TOTAL_SEATS) return;
      if (seen.has(acNo)) return;
      seen.add(acNo);
      const leadCandidate = cells.eq(2).text().trim();
      const leadPartyFull = cells.eq(3).find("table").first().children("tbody").children("tr").children("td").first().text().trim();
      const trailCandidate = cells.eq(4).text().trim();
      const trailPartyFull = cells.eq(5).find("table").first().children("tbody").children("tr").children("td").first().text().trim();
      const margin = parseInt(cells.eq(6).text().replace(/,/g, "").trim()) || 0;
      constituencies.push({
        id: acNo,
        name,
        district: getDistrict(acNo),
        leadingCandidate: leadCandidate,
        leadingParty: resolveAbbr(leadPartyFull) || leadPartyFull,
        trailingCandidate: trailCandidate,
        trailingParty: resolveAbbr(trailPartyFull) || trailPartyFull,
        margin,
        status: "Won",
      });
    });
  }

  return constituencies.sort((a, b) => a.id - b.id);
}

async function fetchConstituencyDetail(id) {
  const res = await fetch(`${ECI_BASE}/Constituencywise${STATE}${id}.htm`);
  if (!res.ok) { console.error(`Constituencywise${STATE}${id}: ${res.status}`); return null; }
  const html = await res.text();
  const $ = cheerio.load(html);

  const h2Text = $("h2").text();
  const nameMatch = h2Text.match(/Assembly Constituency\s+\d+\s*[-–]\s*([^(]+)/i);
  const name = nameMatch?.[1]?.trim() ?? `Constituency ${id}`;

  const candidates = [];
  $("table tbody tr").each((_, row) => {
    const cells = $(row).children("td");
    if (cells.length < 5) return;
    const col1 = cells.eq(1).text().trim();
    const col2 = cells.eq(2).text().trim();
    if (!col1 || !col2 || /candidate|party|name/i.test(col1)) return;
    const evmVotes = parseInt(cells.eq(3).text().replace(/,/g, "").trim()) || 0;
    const postalVotes = parseInt(cells.eq(4).text().replace(/,/g, "").trim()) || 0;
    const totalVotes = cells.length > 5 ? (parseInt(cells.eq(5).text().replace(/,/g, "").trim()) || evmVotes + postalVotes) : evmVotes + postalVotes;
    const percentage = cells.length > 6 ? (parseFloat(cells.eq(6).text().trim()) || 0) : 0;
    candidates.push({ rank: candidates.length + 1, name: col1, party: resolveAbbr(col2) || col2, evmVotes, postalVotes, totalVotes, percentage, isLeading: false });
  });

  candidates.sort((a, b) => b.totalVotes - a.totalVotes);
  candidates.forEach((c, i) => { c.rank = i + 1; c.isLeading = i === 0; });

  const bodyText = $("body").text();
  const round = bodyText.match(/Round\s+(\d+\s+of\s+\d+)/i)?.[1] ?? bodyText.match(/Round\s+(\d+)/i)?.[1] ?? "";
  const lastUpdated = bodyText.match(/Last Updated[:\s]+([^\n]+)/i)?.[1]?.trim() ?? "";

  return { id, name, district: getDistrict(id), candidates, totalVotesCounted: candidates.reduce((s, c) => s + c.totalVotes, 0), round, lastUpdated };
}

async function fetchAllConstituencyDetails() {
  const BATCH = 20;
  const results = [];
  for (let start = 1; start <= TOTAL_SEATS; start += BATCH) {
    const ids = Array.from({ length: Math.min(BATCH, TOTAL_SEATS + 1 - start) }, (_, i) => start + i);
    const batch = await Promise.all(ids.map(fetchConstituencyDetail));
    results.push(...batch);
    process.stdout.write(`  fetched AC ${start}–${start + ids.length - 1}\n`);
  }
  return results.filter(Boolean);
}

// Main
console.log("Fetching West Bengal 2026 data...");
const [summary, constituencies] = await Promise.all([fetchSummary(), fetchAllConstituencies()]);

if (!summary.parties.length || !constituencies.length) {
  console.error("ERROR: ECI returned empty data. Aborting.");
  process.exit(1);
}

console.log(`Summary: ${summary.parties.length} parties, top: ${summary.parties[0]?.party} ${summary.parties[0]?.total}`);
console.log(`Constituencies: ${constituencies.length} fetched`);

mkdirSync("data/westbengal", { recursive: true });
mkdirSync("data/westbengal/constituency", { recursive: true });
writeFileSync("data/westbengal/summary.json", JSON.stringify(summary));
writeFileSync("data/westbengal/constituencies.json", JSON.stringify(constituencies));

console.log("Fetching all 294 constituency details...");
const details = await fetchAllConstituencyDetails();
for (const d of details) {
  writeFileSync(`data/westbengal/constituency/${d.id}.json`, JSON.stringify(d));
}
console.log(`Written ${details.length} constituency detail files`);
