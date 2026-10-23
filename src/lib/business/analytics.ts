import type { Application, ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUS_LABELS } from "./application-status";

export interface StatusDistributionPoint {
  status: string;
  count: number;
}

export function computeStatusDistribution(applications: Application[]): StatusDistributionPoint[] {
  const counts = new Map<ApplicationStatus, number>();
  for (const app of applications) {
    counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, count]) => ({
    status: APPLICATION_STATUS_LABELS[status],
    count,
  }));
}

export interface DepartmentPlacementPoint {
  department: string;
  applied: number;
  selected: number;
}

export function computeDepartmentPlacement(applications: Application[]): DepartmentPlacementPoint[] {
  const map = new Map<string, { applied: number; selected: number }>();
  for (const app of applications) {
    const entry = map.get(app.department) ?? { applied: 0, selected: 0 };
    entry.applied += 1;
    if (app.status === "selected") entry.selected += 1;
    map.set(app.department, entry);
  }
  return Array.from(map.entries()).map(([department, v]) => ({ department, ...v }));
}

export interface CompanyApplicationsPoint {
  company: string;
  applications: number;
}

export function computeTopCompanies(applications: Application[], limit = 6): CompanyApplicationsPoint[] {
  const map = new Map<string, number>();
  for (const app of applications) {
    map.set(app.companyName, (map.get(app.companyName) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([company, applications]) => ({ company, applications }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, limit);
}

export interface MonthlyApplicationsPoint {
  month: string;
  applications: number;
}

export function computeApplicationsOverTime(applications: Application[]): MonthlyApplicationsPoint[] {
  const map = new Map<string, number>();
  for (const app of applications) {
    const date = new Date(app.appliedAt);
    const key = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([month, applications]) => ({ month, applications }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}
