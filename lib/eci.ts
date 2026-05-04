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

function readLocalJson<T>(filename: string): T {
  const p = path.join(process.cwd(), "data", filename);
  if (!existsSync(p)) throw new Error(`Data file not found: ${p}`);
  return JSON.parse(readFileSync(p, "utf-8")) as T;
}

export async function fetchSummary(): Promise<SummaryData> {
  return readLocalJson<SummaryData>("summary.json");
}

export async function fetchAllConstituencies(): Promise<Constituency[]> {
  return readLocalJson<Constituency[]>("constituencies.json");
}

export async function fetchConstituencyDetail(
  id: number
): Promise<ConstituencyDetail> {
  return readLocalJson<ConstituencyDetail>(`constituency/${id}.json`);
}

// ---------------------------------------------------------------------------
// Pondicherry
// ---------------------------------------------------------------------------
export async function fetchPondicherrySummary(): Promise<SummaryData> {
  return readLocalJson<SummaryData>("pondicherry/summary.json");
}

export async function fetchPondicherryConstituencies(): Promise<Constituency[]> {
  return readLocalJson<Constituency[]>("pondicherry/constituencies.json");
}

export async function fetchPondicherryConstituencyDetail(
  id: number
): Promise<ConstituencyDetail> {
  return readLocalJson<ConstituencyDetail>(`pondicherry/constituency/${id}.json`);
}

// ---------------------------------------------------------------------------
// Kerala
// ---------------------------------------------------------------------------
export async function fetchKeralaummary(): Promise<SummaryData> {
  return readLocalJson<SummaryData>("kerala/summary.json");
}

export async function fetchKeralaConstituencies(): Promise<Constituency[]> {
  return readLocalJson<Constituency[]>("kerala/constituencies.json");
}

// ---------------------------------------------------------------------------
// West Bengal
// ---------------------------------------------------------------------------
export async function fetchWBSummary(): Promise<SummaryData> {
  return readLocalJson<SummaryData>("westbengal/summary.json");
}

export async function fetchWBConstituencies(): Promise<Constituency[]> {
  return readLocalJson<Constituency[]>("westbengal/constituencies.json");
}

export async function fetchWBConstituencyDetail(
  id: number
): Promise<ConstituencyDetail> {
  return readLocalJson<ConstituencyDetail>(`westbengal/constituency/${id}.json`);
}

export async function fetchKeralaConstituencyDetail(
  id: number
): Promise<ConstituencyDetail> {
  return readLocalJson<ConstituencyDetail>(`kerala/constituency/${id}.json`);
}
