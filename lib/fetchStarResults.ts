import { fetchConstituencyDetail } from "./eci";
import { STAR_CANDIDATES, type StarCandidate } from "./starCandidates";
import type { CandidateResult } from "./types";

export interface StarCandidateResult {
  meta: StarCandidate;
  constituencyName: string;
  acId: number;
  candidate: CandidateResult | null;
  /** Leading candidate (could be the star or their opponent) */
  leader: CandidateResult | null;
  totalCandidates: number;
  totalVotesCounted: number;
  margin: number;
  status: "Leading" | "Trailing" | "Unknown";
  round: string;
  lastUpdated: string;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesEciName(candidate: CandidateResult, eciName: string): boolean {
  const a = normalizeName(candidate.name);
  const b = normalizeName(eciName);
  // Check if either name contains the other's key words
  const aWords = a.split(" ").filter((w) => w.length > 2);
  const bWords = b.split(" ").filter((w) => w.length > 2);
  const matches = bWords.filter((w) => aWords.some((aw) => aw.includes(w) || w.includes(aw)));
  return matches.length >= Math.min(2, bWords.length);
}

export async function fetchAllStarResults(): Promise<StarCandidateResult[]> {
  const details = await Promise.all(
    STAR_CANDIDATES.map((sc) => fetchConstituencyDetail(sc.acId))
  );

  return STAR_CANDIDATES.map((meta, i) => {
    const detail = details[i];
    const leader = detail.candidates[0] ?? null;

    // Find the star candidate in the results
    const candidate =
      detail.candidates.find((c) => matchesEciName(c, meta.eciName)) ?? null;

    const isLeading = candidate?.isLeading ?? false;
    const margin =
      candidate && leader
        ? Math.abs(candidate.totalVotes - (detail.candidates[1]?.totalVotes ?? 0))
        : 0;

    return {
      meta,
      constituencyName: detail.name,
      acId: meta.acId,
      candidate,
      leader,
      totalCandidates: detail.candidates.length,
      totalVotesCounted: detail.totalVotesCounted,
      margin: isLeading
        ? (leader?.totalVotes ?? 0) - (detail.candidates[1]?.totalVotes ?? 0)
        : (leader?.totalVotes ?? 0) - (candidate?.totalVotes ?? 0),
      status: candidate ? (isLeading ? "Leading" : "Trailing") : "Unknown",
      round: detail.round,
      lastUpdated: detail.lastUpdated,
    };
  });
}
