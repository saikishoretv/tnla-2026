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
  // Sitting Ministers — DMK Government
  {
    displayName: "Duraimurugan",
    role: "Sitting Minister · Water Resources",
    party: "DMK",
    acId: 40,
    eciName: "DURAIMURUGAN",
  },
  {
    displayName: "K. N. Nehru",
    role: "Sitting Minister · Municipal Administration",
    party: "DMK",
    acId: 140,
    eciName: "K.N.NEHRU",
  },
  {
    displayName: "S. S. Sivasankar",
    role: "Sitting Minister · Commercial Taxes",
    party: "DMK",
    acId: 148,
    eciName: "SIVASANKAR. S.S",
  },
  {
    displayName: "Thangam Thennarasu",
    role: "Sitting Minister · Industries",
    party: "DMK",
    acId: 208,
    eciName: "THANGAM THENARASU",
  },
  {
    displayName: "Anitha R. Radhakrishnan",
    role: "Sitting Minister · Environment",
    party: "DMK",
    acId: 215,
    eciName: "ANITHA R. RADHAKRISHNAN",
  },
  {
    displayName: "V. Senthil Balaji",
    role: "Sitting Minister · Electricity",
    party: "DMK",
    acId: 120,
    eciName: "V SENTHILBALAJI",
  },
  {
    displayName: "Anbil Mahesh Poyyamozhi",
    role: "Sitting Minister · School Education",
    party: "DMK",
    acId: 142,
    eciName: "ANBIL MAHESH POYYAMOZHI",
  },
  {
    displayName: "Palanivel Thiagarajan",
    role: "Sitting Minister · Finance",
    party: "DMK",
    acId: 193,
    eciName: "PALANIVEL THIAGA RAJAN",
  },
  {
    displayName: "C. V. Ganesan",
    role: "Sitting Minister · Law",
    party: "DMK",
    acId: 151,
    eciName: "GANESAN C.V",
  },
  // Sitting Ministers — AIADMK (Opposition)
  {
    displayName: "S. P. Velumani",
    role: "Ex-Minister · AIADMK",
    party: "AIADMK",
    acId: 119,
    eciName: "S.P.VELUMANI",
  },
  {
    displayName: "C. Vijayabaskar",
    role: "Ex-Minister · AIADMK",
    party: "AIADMK",
    acId: 179,
    eciName: "VIJAYABASKAR. C",
  },
];
