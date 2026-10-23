"use client";

import * as React from "react";
import type { PlacementUpdate } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone, Search } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  new_drive: "New Drive",
  interview_schedule: "Interview Schedule",
  assessment: "Assessment",
  company_update: "Company Update",
  deadline_reminder: "Deadline Reminder",
  selection_announcement: "Selection Announcement",
  notice: "Notice",
};

export function StudentUpdatesClient({ updates }: { updates: PlacementUpdate[] }) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return updates;
    return updates.filter((u) => u.title.toLowerCase().includes(term) || u.body.toLowerCase().includes(term));
  }, [updates, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-md">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search updates..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={updates.length === 0 ? "No updates yet" : "No matching updates"}
          description={
            updates.length === 0
              ? "Placement announcements from your TPO will show up here."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((update) => (
            <Card key={update.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{update.title}</p>
                  <Badge variant="default">{CATEGORY_LABELS[update.category]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{update.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(update.createdAt).toLocaleString("en-IN")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
