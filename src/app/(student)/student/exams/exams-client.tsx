"use client";

import * as React from "react";
import type { PlacementExam } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock, ExternalLink, GraduationCap, Search } from "lucide-react";

export function StudentExamsClient({ exams }: { exams: PlacementExam[] }) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return exams;
    return exams.filter(
      (e) => e.name.toLowerCase().includes(term) || (e.companyName ?? "").toLowerCase().includes(term)
    );
  }, [exams, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-md">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by exam name or company..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={exams.length === 0 ? "No upcoming exams" : "No matching exams"}
          description={
            exams.length === 0
              ? "Placement exams you're eligible for will show up here."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exam) => (
            <Card key={exam.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-slate-900">{exam.name}</p>
                {exam.companyName && <p className="text-xs text-slate-500">{exam.companyName}</p>}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(exam.date).toLocaleDateString("en-IN")} · {exam.time} · {exam.durationMinutes} mins
                </div>
                <Badge variant="purple" className="mt-2 capitalize">
                  {exam.examType}
                </Badge>
                {exam.instructions && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{exam.instructions}</p>
                )}
                {exam.examLink && (
                  <a href={exam.examLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Exam Link
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
