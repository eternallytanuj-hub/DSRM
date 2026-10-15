/**
 * DSRM Compliance and Sanctions Screening Configuration
 * Placeholder lists for sanctions gating and export-control risk categorization.
 * NOTE: UI gating is client-side only; backend re-enforces these policies authoritatively.
 */

export interface CountryInfo {
  code: string;
  name: string;
}

// Comprehensively sanctioned jurisdictions (placeholder list for testing & demonstration)
export const BLOCKED_COUNTRY_CODES: readonly string[] = [
  "CU", // Cuba
  "IR", // Iran
  "KP", // North Korea
  "SY", // Syria
  "RU", // Russia (comprehensive sanctions regime)
] as const;

// High-risk or heightened due-diligence jurisdictions
export const HIGH_RISK_COUNTRY_CODES: readonly string[] = [
  "BY", // Belarus
  "MM", // Myanmar
  "VE", // Venezuela
  "ZW", // Zimbabwe
] as const;

export const SCHEDULE_C_CATEGORIES = [
  {
    id: "scientific_research",
    label: "Scientific research and education",
    highRisk: false,
  },
  {
    id: "commercial_comms",
    label: "Commercial communications",
    highRisk: false,
  },
  {
    id: "commercial_earth_obs",
    label: "Commercial Earth observation (non-defence)",
    highRisk: true,
  },
  {
    id: "edge_compute",
    label: "Edge compute and experimentation",
    highRisk: false,
  },
  {
    id: "government_civil",
    label: "Government civil use",
    highRisk: true,
  },
  {
    id: "other",
    label: "Other",
    highRisk: true,
  },
] as const;

export type ScheduleCCategoryId = (typeof SCHEDULE_C_CATEGORIES)[number]["id"];

export const COUNTRY_LIST: CountryInfo[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "KR", name: "South Korea" },
  { code: "NZ", name: "New Zealand" },
  // Sanctioned / High risk placeholders for verification
  { code: "CU", name: "Cuba (Sanctioned)" },
  { code: "IR", name: "Iran (Sanctioned)" },
  { code: "KP", name: "North Korea (Sanctioned)" },
  { code: "SY", name: "Syria (Sanctioned)" },
  { code: "RU", name: "Russian Federation (Sanctioned)" },
  { code: "BY", name: "Belarus (High Risk)" },
  { code: "MM", name: "Myanmar (High Risk)" },
  { code: "VE", name: "Venezuela (High Risk)" },
];

export function isCountryBlocked(code: string): boolean {
  if (!code) return false;
  return BLOCKED_COUNTRY_CODES.includes(code.toUpperCase());
}

export function isCountryHighRisk(code: string): boolean {
  if (!code) return false;
  return HIGH_RISK_COUNTRY_CODES.includes(code.toUpperCase());
}

export function isCategoryHighRisk(categoryLabelOrId: string): boolean {
  const match = SCHEDULE_C_CATEGORIES.find(
    (c) => c.id === categoryLabelOrId || c.label === categoryLabelOrId
  );
  return match ? match.highRisk : false;
}
