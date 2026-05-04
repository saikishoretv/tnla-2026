/**
 * Fetches Pondicherry 2026 election data and writes JSON files to data/pondicherry/
 * Run from your laptop: node scripts/fetch-pondicherry.mjs
 */
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";

const ECI_BASE = "https://results.eci.gov.in/ResultAcGenMay2026";
const STATE = "U07";
const TOTAL_PAGES = 2;
const TOTAL_SEATS = 30;
const MAJORITY = 16;

const PARTY_FULL_NAMES = {
  AINRC: "All India N.R. Congress",
  BJP: "Bharatiya Janata Party",
  DMK: "Dravida Munnetra Kazhagam",
  INC: "Indian National Congress",
  AIADMK: "All India Anna Dravida Munnetra Kazhagam",
  TVK: "Tamilaga Vettri Kazhagam",
  LJK: "Latchiya Jananayaka Katchi",
  NMK: "Neyam Makkal Kazhagam",
  IND: "Independent",
};

const PARTY_COLORS = {
  AINRC: "#F97316",
  BJP: "#F97316",
  DMK: "#F97316",
  INC: "#3B82F6",
  AIADMK: "#22C55E",
  TVK: "#FACC15",
  LJK: "#8B5CF6",
  NMK: "#6B7280",
  IND: "#6B7280",
};

const ALLIANCES = {
  AINRC: "NDA Alliance",
  BJP: "NDA Alliance",
  INC: "INC Alliance",
  DMK: "INC Alliance",
  TVK: "TVK (Solo)",
  AIADMK: "Others",
  LJK: "Others",
  NMK: "Others",
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
  return fullName.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 6);
}

function getDistrict(acNo) {
  if (acNo >= 1 && acNo <= 15) return "Puducherry";
  if (acNo >= 16 && acNo <= 22) return "Karaikal";
  if (acNo === 23) return "Mahe";
  if (acNo >= 24 && acNo <= 30) return "Yanam";
  return "Puducherry";
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
  $s("table tbody tr").each((_, row) => {
    const cells = $s(row).children("td");
    if (cells.length < 4) return;
    const partyCell = cells.eq(3);
    const partyFullName = partyCell.find("table").first().children("tbody").children("tr").children("td").first().text().trim();
    if (!partyFullName) return;
    const abbr = resolveAbbr(partyFullName);
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
      const existing = partyMap.get(abbr);
      if (existing.won === 0 && won > 0) partyMap.set(abbr, { won, leading, trailing });
    }
  });

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

// Main
console.log("Fetching Pondicherry 2026 data...");
const [summary, constituencies] = await Promise.all([fetchSummary(), fetchAllConstituencies()]);

if (!summary.parties.length || !constituencies.length) {
  console.error("ERROR: ECI returned empty data. Aborting.");
  process.exit(1);
}

console.log(`Summary: ${summary.parties.length} parties, top: ${summary.parties[0]?.party} ${summary.parties[0]?.total}`);
console.log(`Constituencies: ${constituencies.length} fetched`);

mkdirSync("data/pondicherry/constituency", { recursive: true });
writeFileSync("data/pondicherry/summary.json", JSON.stringify(summary));
writeFileSync("data/pondicherry/constituencies.json", JSON.stringify(constituencies));

console.log("Fetching all 30 constituency details...");
const details = [];
for (let i = 1; i <= TOTAL_SEATS; i++) {
  const d = await fetchConstituencyDetail(i);
  if (d) { details.push(d); writeFileSync(`data/pondicherry/constituency/${i}.json`, JSON.stringify(d)); }
}
console.log(`Written ${details.length} constituency detail files`);
