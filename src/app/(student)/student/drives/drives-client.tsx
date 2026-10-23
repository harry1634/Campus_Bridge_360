"use client";

import * as React from "react";
import type { PlacementDrive } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2, Calendar, MapPin, Search } from "lucide-react";

export function StudentDrivesClient({ drives }: { drives: PlacementDrive[] }) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return drives;
    return drives.filter(
      (d) => d.companyName.toLowerCase().includes(term) || d.jobRole.toLowerCase().includes(term)
    );
  }, [drives, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-md">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company or role..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={drives.length === 0 ? "No eligible drives right now" : "No matching drives"}
          description={
            drives.length === 0
              ? "Placement drives you're eligible for will show up here."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((drive) => (
            <Card key={drive.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                    {drive.companyName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{drive.jobRole}</p>
                    <p className="text-xs text-slate-500">{drive.companyName}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(drive.driveDate).toLocaleDateString("en-IN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {drive.location}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-emerald-600">{drive.package}</p>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{drive.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {drive.recruitmentStages.map((stage) => (
                    <Badge key={stage} variant="outline">
                      {stage}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
