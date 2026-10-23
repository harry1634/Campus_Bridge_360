export interface AcademicCycle {
  label: string;
  endYear: number;
}

// Ordered newest-first to match the dropdown's display order.
export const ACADEMIC_CYCLES: AcademicCycle[] = [
  { label: "2025 – 2026", endYear: 2026 },
  { label: "2024 – 2025", endYear: 2025 },
  { label: "2023 – 2024", endYear: 2024 },
  { label: "2022 – 2023", endYear: 2023 },
];

export const DEFAULT_CYCLE_LABEL = "2024 – 2025";

export function resolveCycle(label?: string | null): AcademicCycle {
  return (
    ACADEMIC_CYCLES.find((c) => c.label === label) ??
    ACADEMIC_CYCLES.find((c) => c.label === DEFAULT_CYCLE_LABEL)!
  );
}

/** Pulls the graduation year out of a batch string like "2022-2026" -> 2026. */
export function parseBatchEndYear(batch: string): number | null {
  const match = batch.match(/(\d{4})\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

/** An empty batches list means "no batch restriction" — relevant to every cycle. */
export function batchesMatchCycle(batches: string[], endYear: number): boolean {
  if (batches.length === 0) return true;
  return batches.some((b) => parseBatchEndYear(b) === endYear);
}
