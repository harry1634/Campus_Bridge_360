export const DEPARTMENTS = ["CSE", "IT", "EEE", "ECE", "MECH", "CIVIL", "CHEM", "AIML", "DS"] as const;

export const DEPARTMENT_LABELS: Record<(typeof DEPARTMENTS)[number], string> = {
  CSE: "CSE",
  IT: "IT",
  EEE: "EEE",
  ECE: "ECE",
  MECH: "Mechanical",
  CIVIL: "Civil",
  CHEM: "Chemical",
  AIML: "AI & ML",
  DS: "Data Science",
};

// Free-text spellings TPOs/imports commonly use, mapped to the canonical
// department code above. Lookup key must be lowercased with collapsed
// whitespace before matching.
const DEPARTMENT_ALIASES: Record<string, (typeof DEPARTMENTS)[number]> = {
  cse: "CSE",
  "computer science": "CSE",
  "computer science and engineering": "CSE",
  it: "IT",
  "information technology": "IT",
  eee: "EEE",
  "electrical and electronics": "EEE",
  "electrical and electronics engineering": "EEE",
  ece: "ECE",
  electronics: "ECE",
  "electronics and communication": "ECE",
  "electronics and communication engineering": "ECE",
  mech: "MECH",
  mechanical: "MECH",
  "mechanical engineering": "MECH",
  civil: "CIVIL",
  "civil engineering": "CIVIL",
  chem: "CHEM",
  chemical: "CHEM",
  "chemical engineering": "CHEM",
  aiml: "AIML",
  "ai & ml": "AIML",
  "ai and ml": "AIML",
  "ai&ml": "AIML",
  "artificial intelligence and machine learning": "AIML",
  ds: "DS",
  "data science": "DS",
};

/**
 * Resolves free-text department input (from imports or TPO-authored forms)
 * to the canonical department code, or null if it doesn't match anything
 * known. Case- and whitespace-insensitive, and accepts the canonical code
 * itself.
 */
export function normalizeDepartment(input: string): (typeof DEPARTMENTS)[number] | null {
  const key = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (DEPARTMENT_ALIASES[key]) return DEPARTMENT_ALIASES[key];
  const upper = input.trim().toUpperCase();
  if ((DEPARTMENTS as readonly string[]).includes(upper)) {
    return upper as (typeof DEPARTMENTS)[number];
  }
  return null;
}
