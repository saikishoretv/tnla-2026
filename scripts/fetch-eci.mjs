/**
 * Fetches ECI election data and writes JSON files to data/
 * Run from your laptop: node scripts/fetch-eci.mjs
 */
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";

const ECI_BASE = "https://results.eci.gov.in/ResultAcGenMay2026";

const PARTY_FULL_NAMES = {
  TVK: "Tamilaga Vettri Kazhagam",
  DMK: "Dravida Munnetra Kazhagam",
  ADMK: "All India Anna Dravida Munnetra Kazhagam",
  AIADMK: "All India Anna Dravida Munnetra Kazhagam",
  INC: "Indian National Congress",
  PMK: "Pattali Makkal Katchi",
  BJP: "Bharatiya Janata Party",
  NTK: "Naam Tamilar Katchi",
  AMMK: "Amma Makkal Munnettra Kazagam",
  CPI: "Communist Party of India",
  "CPI(M)": "Communist Party of India (Marxist)",
  VCK: "Viduthalai Chiruthaigal Katchi",
  IUML: "Indian Union Muslim League",
  MDMK: "Marumalarchi Dravida Munnetra Kazhagam",
  DMDK: "Desiya Murpokku Dravida Kazhagam",
  IND: "Independent",
};

const PARTY_COLORS = {
  TVK: "#FACC15",
  DMK: "#F97316",
  ADMK: "#22C55E",
  AIADMK: "#22C55E",
  INC: "#F97316",
  PMK: "#22C55E",
  BJP: "#22C55E",
  NTK: "#EF4444",
  AMMK: "#22C55E",
  CPI: "#F97316",
  "CPI(M)": "#F97316",
  VCK: "#F97316",
  IUML: "#F97316",
  MDMK: "#F97316",
  DMDK: "#F97316",
  IND: "#6B7280",
};

const ALLIANCES = {
  DMK: "SPA Alliance",
  INC: "SPA Alliance",
  CPI: "SPA Alliance",
  "CPI(M)": "SPA Alliance",
  VCK: "SPA Alliance",
  MDMK: "SPA Alliance",
  DMDK: "SPA Alliance",
  IUML: "SPA Alliance",
  ADMK: "ADMK+ Alliance",
  AIADMK: "ADMK+ Alliance",
  BJP: "ADMK+ Alliance",
  PMK: "ADMK+ Alliance",
  AMMK: "ADMK+ Alliance",
  TVK: "TVK (Solo)",
  NTK: "NTK (Solo)",
};

const FULL_TO_ABBR = new Map(
  Object.entries(PARTY_FULL_NAMES).map(([abbr, full]) => [
    full.toLowerCase(),
    abbr,
  ])
);

function resolveAbbr(fullName) {
  const key = fullName.toLowerCase().trim();
  if (FULL_TO_ABBR.has(key)) return FULL_TO_ABBR.get(key);
  for (const [full, abbr] of FULL_TO_ABBR.entries()) {
    const r = key;
    if (r.includes(full.slice(0, 12)) || full.includes(r.slice(0, 12)))
      return abbr;
  }
  return fullName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 6);
}

function getDistrict(acNo) {
  const map = [
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

async function fetchSummary() {
  const [chartRes, stateRes] = await Promise.all([
    fetch(`${ECI_BASE}/chartwiseresult-S22.htm`),
    fetch(`${ECI_BASE}/statewiseS221.htm`),
  ]);

  if (!chartRes.ok) {
    console.error(`chartwiseresult: ${chartRes.status}`);
    return { parties: [], total: 234, majority: 118, lastUpdated: "", statusLine: "" };
  }

  const [chartHtml, stateHtml] = await Promise.all([
    chartRes.text(),
    stateRes.text(),
  ]);

  const xMatch = chartHtml.match(/var xValues\s*=\s*\[([^\]]*)\]/);
  const yMatch = chartHtml.match(/var yValues\s*=\s*\[([^\]]*)\]/);

  const partyMap = new Map();

  if (xMatch && yMatch) {
    const nameRe = /'([^']+)'/g;
    const names = [];
    let m;
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

  const $s = cheerio.load(stateHtml);
  $s("table tbody tr").each((_, row) => {
    const cells = $s(row).children("td");
    if (cells.length < 4) return;
    const partyCell = cells.eq(3);
    const nestedTds = partyCell
      .find("table")
      .first()
      .children("tbody")
      .children("tr")
      .children("td");
    const partyFullName = nestedTds.first().text().trim();
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
      if (existing.won === 0 && won > 0) {
        partyMap.set(abbr, { won, leading, trailing });
      }
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
      won: v.won,
      leading: v.leading,
      trailing: v.trailing,
      total: v.won + v.leading,
      color: PARTY_COLORS[abbr] ?? "#6B7280",
      alliance: ALLIANCES[abbr] ?? "Others",
    }))
    .sort((a, b) => b.total - a.total);

  return { parties, total: 234, majority: 118, lastUpdated, statusLine };
}

async function fetchAllConstituencies() {
  const pages = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const res = await fetch(`${ECI_BASE}/statewiseS22${i + 1}.htm`);
      if (!res.ok) {
        console.error(`statewiseS22${i + 1}: ${res.status}`);
        return "";
      }
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
      if (!name || isNaN(acNo) || acNo < 1 || acNo > 234) return;
      if (seen.has(acNo)) return;
      seen.add(acNo);
      const leadCandidate = cells.eq(2).text().trim();
      const leadPartyFull = cells.eq(3).find("table").first().children("tbody").children("tr").children("td").first().text().trim();
      const trailCandidate = cells.eq(4).text().trim();
      const trailPartyFull = cells.eq(5).find("table").first().children("tbody").children("tr").children("td").first().text().trim();
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

async function fetchConstituencyDetail(id) {
  const res = await fetch(`${ECI_BASE}/ConstituencywiseS22${id}.htm`);
  if (!res.ok) { console.error(`ConstituencywiseS22${id}: ${res.status}`); return null; }
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
  for (let start = 1; start <= 234; start += BATCH) {
    const ids = Array.from({ length: Math.min(BATCH, 235 - start) }, (_, i) => start + i);
    const batch = await Promise.all(ids.map(fetchConstituencyDetail));
    results.push(...batch);
    process.stdout.write(`  fetched AC ${start}–${start + ids.length - 1}\n`);
  }
  return results.filter(Boolean);
}

// Main — abort if ECI is unreachable (e.g. GitHub Actions IPs are blocked)
console.log("Fetching ECI data...");
const [summary, constituencies] = await Promise.all([
  fetchSummary(),
  fetchAllConstituencies(),
]);

if (!summary.parties.length || !constituencies.length) {
  console.error("ERROR: ECI returned empty data — likely IP blocked. Aborting without overwriting files.");
  process.exit(1);
}

console.log(`Summary: ${summary.parties.length} parties, top: ${summary.parties[0]?.party} ${summary.parties[0]?.total}`);
console.log(`Constituencies: ${constituencies.length} fetched`);

mkdirSync("data", { recursive: true });
writeFileSync("data/summary.json", JSON.stringify(summary));
writeFileSync("data/constituencies.json", JSON.stringify(constituencies));

console.log("Fetching all 234 constituency details...");
const details = await fetchAllConstituencyDetails();
mkdirSync("data/constituency", { recursive: true });
for (const d of details) {
  writeFileSync(`data/constituency/${d.id}.json`, JSON.stringify(d));
}
console.log(`Written ${details.length} constituency detail files`);

