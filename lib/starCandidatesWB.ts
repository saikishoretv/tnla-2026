export interface StarCandidateWB {
  displayName: string;
  role: string;
  party: string;
  acId: number;
  eciName: string;
}

export const STAR_CANDIDATES_WB: StarCandidateWB[] = [
  // Sitting Ministers — TMC Government (Mamata's cabinet)
  {
    displayName: "Mamata Banerjee",
    role: "TMC Chief · Chief Minister",
    party: "TMC",
    acId: 159,
    eciName: "MAMATA BANERJEE",
  },
  {
    displayName: "Firhad Hakim",
    role: "Sitting Minister · Urban Development",
    party: "TMC",
    acId: 158,
    eciName: "FIRHAD HAKIM",
  },
  {
    displayName: "Sobhandeb Chattopadhyay",
    role: "Sitting Minister · Agriculture",
    party: "TMC",
    acId: 161,
    eciName: "SOBHANDEB CHATTOPADHYAY",
  },
  {
    displayName: "Chandrima Bhattacharya",
    role: "Sitting Minister · Finance",
    party: "TMC",
    acId: 110,
    eciName: "CHANDRIMA BHATTACHARYA",
  },
  {
    displayName: "Bratya Basu",
    role: "Sitting Minister · Education",
    party: "TMC",
    acId: 114,
    eciName: "BRATYABRATA BASU",
  },
  {
    displayName: "Aroop Biswas",
    role: "Sitting Minister · Power",
    party: "TMC",
    acId: 152,
    eciName: "AROOP BISWAS",
  },
  {
    displayName: "Pulak Roy",
    role: "Sitting Minister · Industrial Reconstruction",
    party: "TMC",
    acId: 178,
    eciName: "PULAK ROY",
  },
  // BJP Leaders
  {
    displayName: "Suvendu Adhikari",
    role: "BJP · Leader of Opposition",
    party: "BJP",
    acId: 210,
    eciName: "ADHIKARI SUVENDU",
  },
  {
    displayName: "Dilip Ghosh",
    role: "BJP National Vice President",
    party: "BJP",
    acId: 224,
    eciName: "DILIP GHOSH",
  },
];
