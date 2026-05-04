/**
 * Fetches Assam 2026 election data and writes JSON files to data/assam/
 * Run from your laptop: node scripts/fetch-assam.mjs
 */
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";

const ECI_BASE = "https://results.eci.gov.in/ResultAcGenMay2026";
const STATE = "S03";
const TOTAL_PAGES = 7;
const TOTAL_SEATS = 126;
const MAJORITY = 64;

const PARTY_FULL_NAMES = {
  BJP: "Bharatiya Janata Party",
  INC: "Indian National Congress",
  AGP: "Asom Gana Parishad",
  BOPF: "Bodoland Peoples Front",
  AIUDF: "All India United Democratic Front",
  RJRD: "Raijor Dal",
  AITC: "All India Trinamool Congress",
  TMC: "All India Trinamool Congress",
  CPI: "Communist Party of India",
  "CPI(M)": "Communist Party of India (Marxist)",
  IND: "Independent",
};

const PARTY_COLORS = {
  BJP: "#F97316",
  INC: "#3B82F6",
  AGP: "#F59E0B",
  BOPF: "#06B6D4",
  AIUDF: "#10B981",
  RJRD: "#8B5CF6",
  AITC: "#10B981",
  TMC: "#10B981",
  IND: "#6B7280",
};

const ALLIANCES = {
  BJP: "NDA",
  AGP: "NDA",
  BOPF: "NDA",
  INC: "INDIA Alliance",
  AIUDF: "INDIA Alliance",
  RJRD: "Others",
  AITC: "Others",
  TMC: "Others",
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
  if (key.includes("trinamool")) return "AITC";
  if (key.includes("bodoland")) return "BOPF";
  if (key.includes("asom gana")) return "AGP";
  if (key.includes("united democratic front")) return "AIUDF";
  if (key.includes("raijor")) return "RJRD";
  return fullName.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 6);
}

function getDistrict(acNo) {
  const map = [
    [1, 11, "Kokrajhar"],
    [12, 18, "Dhubri"],
    [19, 24, "Bongaigaon"],
    [25, 33, "Barpeta"],
    [34, 41, "Nalbari"],
    [42, 52, "Kamrup"],
    [53, 62, "Kamrup Metropolitan"],
    [63, 69, "Darrang"],
    [70, 74, "Udalguri"],
    [75, 83, "Sonitpur"],
    [84, 89, "Lakhimpur"],
    [90, 93, "Dhemaji"],
    [94, 99, "Tinsukia"],
    [100, 108, "Dibrugarh"],
    [109, 115, "Sibasagar"],
    [116, 121, "Jorhat"],
    [122, 126, "Golaghat"],
  ];
  for (const [start, end, district] of map) {
    if (acNo >= start && acNo <= end) return district;
  }
  return "Assam";
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
console.log("Fetching Assam 2026 data...");
const [summary, constituencies] = await Promise.all([fetchSummary(), fetchAllConstituencies()]);

if (!summary.parties.length || !constituencies.length) {
  console.error("ERROR: ECI returned empty data. Aborting.");
  process.exit(1);
}

console.log(`Summary: ${summary.parties.length} parties, top: ${summary.parties[0]?.party} ${summary.parties[0]?.total}`);
console.log(`Constituencies: ${constituencies.length} fetched`);

mkdirSync("data/assam", { recursive: true });
mkdirSync("data/assam/constituency", { recursive: true });
writeFileSync("data/assam/summary.json", JSON.stringify(summary));
writeFileSync("data/assam/constituencies.json", JSON.stringify(constituencies));

console.log("Fetching all 126 constituency details...");
const details = await fetchAllConstituencyDetails();
for (const d of details) {
  writeFileSync(`data/assam/constituency/${d.id}.json`, JSON.stringify(d));
}
console.log(`Written ${details.length} constituency detail files`);
