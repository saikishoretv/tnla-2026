export interface StarCandidate {
  displayName: string;
  role: string;
  party: string;
  acId: number;
  /** Exact name as it appears in ECI data (for matching) */
  eciName: string;
}

export const STAR_CANDIDATES: StarCandidate[] = [
  {
    displayName: "Thalapathy Vijay",
    role: "TVK Chief · Actor-Politician",
    party: "TVK",
    acId: 12,
    eciName: "C. JOSEPH VIJAY",
  },
  {
    displayName: "Thalapathy Vijay",
    role: "TVK Chief · Actor-Politician (2nd seat)",
    party: "TVK",
    acId: 141,
    eciName: "C. JOSEPH VIJAY",
  },
  {
    displayName: "M. K. Stalin",
    role: "DMK President · Chief Minister",
    party: "DMK",
    acId: 13,
    eciName: "M. K. STALIN",
  },
  {
    displayName: "Udhayanidhi Stalin",
    role: "DMK Treasurer · Deputy CM",
    party: "DMK",
    acId: 19,
    eciName: "UDHAYANIDHI STALIN",
  },
  {
    displayName: "Edappadi K. Palanisami",
    role: "AIADMK General Secretary",
    party: "AIADMK",
    acId: 86,
    eciName: "EDAPPADI PALANISWAMI. K",
  },
  {
    displayName: "Prabhu T. K.",
    role: "TVK General Secretary",
    party: "TVK",
    acId: 184,
    eciName: "DR.PRABHU. TK",
  },
  {
    displayName: "Seeman",
    role: "NTK Chief",
    party: "NTK",
    acId: 10,
    eciName: "SEEMAN",
  },
  {
    displayName: "Sowmiya Anbumani",
    role: "PMK · Daughter of Anbumani Ramadoss",
    party: "PMK",
    acId: 59,
    eciName: "SOWMIYA ANBUMANI",
  },
  {
    displayName: "Premallatha Vijayakant",
    role: "DMDK · Widow of Capt. Vijayakant",
    party: "DMDK",
    acId: 152,
    eciName: "PREMALLATHA VIJAYAKANT",
  },
  {
    displayName: "O. Panneerselvam",
    role: "DMK · Former CM & AIADMK Rebel",
    party: "DMK",
    acId: 200,
    eciName: "PANNEERSELVAM.O",
  },
  {
    displayName: "M. R. K. Panneerselvam",
    role: "DMK · Former AIADMK Treasurer",
    party: "DMK",
    acId: 156,
    eciName: "M.R.K.PANNEERSELVAM",
  },
];
