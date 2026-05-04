export const PARTY_FULL_NAMES: Record<string, string> = {
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

export const PARTY_COLORS: Record<string, string> = {
  // TN parties
  TVK: "#FACC15",
  DMK: "#F97316",
  ADMK: "#22C55E",
  AIADMK: "#22C55E",
  PMK: "#22C55E",
  NTK: "#EF4444",
  AMMK: "#22C55E",
  VCK: "#F97316",
  MDMK: "#F97316",
  DMDK: "#F97316",
  // Shared / national
  INC: "#3B82F6",
  BJP: "#F97316",
  CPI: "#EF4444",
  "CPI(M)": "#EF4444",
  IUML: "#10B981",
  // Pondicherry parties
  AINRC: "#F97316",
  LJK: "#8B5CF6",
  NMK: "#6B7280",
  // Kerala parties
  KC: "#F59E0B",
  "KC(J)": "#D97706",
  NCP: "#8B5CF6",
  RMP: "#EF4444",
  BDJS: "#FB923C",
  CMPKSC: "#EF4444",
  // Fallback
  IND: "#6B7280",
};

export const ALLIANCES: Record<string, string> = {
  // TN alliances
  DMK: "SPA Alliance",
  VCK: "SPA Alliance",
  MDMK: "SPA Alliance",
  DMDK: "SPA Alliance",
  ADMK: "ADMK+ Alliance",
  AIADMK: "ADMK+ Alliance",
  PMK: "ADMK+ Alliance",
  AMMK: "ADMK+ Alliance",
  TVK: "TVK (Solo)",
  NTK: "NTK (Solo)",
  // Pondicherry alliances
  AINRC: "NDA Alliance",
  LJK: "Others",
  NMK: "Others",
  // Kerala alliances
  "CPI(M)": "LDF",
  CPI: "LDF",
  NCP: "LDF",
  RMP: "LDF",
  CMPKSC: "LDF",
  KC: "UDF",
  "KC(J)": "UDF",
  BDJS: "NDA",
  // Shared (context-dependent — Kerala takes precedence here)
  INC: "UDF",
  IUML: "UDF",
  BJP: "NDA",
};

export const ALLIANCE_COLORS: Record<string, string> = {
  // TN
  "SPA Alliance": "#F97316",
  "ADMK+ Alliance": "#22C55E",
  "TVK (Solo)": "#FACC15",
  "NTK (Solo)": "#EF4444",
  // Kerala
  LDF: "#EF4444",
  UDF: "#3B82F6",
  // Pondicherry + shared
  "NDA Alliance": "#F97316",
  "INC Alliance": "#3B82F6",
  NDA: "#F97316",
  Others: "#6B7280",
};

export const ECI_BASE =
  "https://results.eci.gov.in/ResultAcGenMay2026";

export const PARTY_LEADER_IMAGE: Record<string, { src: string; name: string }> = {
  TVK: { src: "/leaders/vijay.jpg", name: "Thalapathy Vijay" },
  DMK: { src: "/leaders/stalin.jpg", name: "MK Stalin" },
  AIADMK: { src: "/leaders/edappadi.jpg", name: "Edappadi K. Palaniswami" },
  ADMK: { src: "/leaders/edappadi.jpg", name: "Edappadi K. Palaniswami" },
};

export const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

export const TN_DISTRICTS = [
  "Chennai",
  "Tiruvallur",
  "Kanchipuram",
  "Chengalpattu",
  "Vellore",
  "Ranipet",
  "Tiruvannamalai",
  "Villupuram",
  "Kallakurichi",
  "Salem",
  "Namakkal",
  "Erode",
  "The Nilgiris",
  "Coimbatore",
  "Tiruppur",
  "Dindigul",
  "Karur",
  "Tiruchirappalli",
  "Perambalur",
  "Ariyalur",
  "Cuddalore",
  "Nagapattinam",
  "Tiruvarur",
  "Thanjavur",
  "Pudukkottai",
  "Sivaganga",
  "Madurai",
  "Theni",
  "Virudhunagar",
  "Ramanathapuram",
  "Thoothukudi",
  "Tirunelveli",
  "Kanniyakumari",
  "Tenkasi",
  "Dharmapuri",
  "Krishnagiri",
];
