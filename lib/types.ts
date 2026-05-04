export interface Constituency {
  id: number;
  name: string;
  district: string;
  leadingCandidate: string;
  leadingParty: string;
  trailingCandidate: string;
  trailingParty: string;
  margin: number;
  status: "Won" | "Leading" | "In Progress";
  round?: string;
}

export interface PartySummary {
  party: string;
  fullName: string;
  won: number;
  leading: number;
  trailing: number;
  total: number;
  color: string;
  alliance: string;
}

export interface SummaryData {
  parties: PartySummary[];
  total: number;
  majority: number;
  lastUpdated: string;
  statusLine: string;
}

export interface CandidateResult {
  rank: number;
  name: string;
  party: string;
  evmVotes: number;
  postalVotes: number;
  totalVotes: number;
  percentage: number;
  isLeading: boolean;
}

export interface ConstituencyDetail {
  id: number;
  name: string;
  district: string;
  candidates: CandidateResult[];
  totalVotesCounted: number;
  round: string;
  lastUpdated: string;
}
