"use client";

import * as React from "react";
import type { Mentor } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, UsersRound } from "lucide-react";

export function StudentMentorsClient({
  mentors,
  requestedMentorIds,
}: {
  mentors: Mentor[];
  requestedMentorIds: string[];
}) {
  const [search, setSearch] = React.useState("");
  const [requesting, setRequesting] = React.useState<string | null>(null);
  const [requested, setRequested] = React.useState<Set<string>>(new Set(requestedMentorIds));
  const [error, setError] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return mentors;
    return mentors.filter(
      (m) => m.name.toLowerCase().includes(term) || m.company.toLowerCase().includes(term)
    );
  }, [mentors, debouncedSearch]);

  async function handleRequest(mentorId: string) {
    setRequesting(mentorId);
    setError(null);
    try {
      const res = await fetch("/api/student/mentorship-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, message: "I'd like guidance on my career path." }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to send request");
        return;
      }
      setRequested((prev) => new Set(prev).add(mentorId));
    } finally {
      setRequesting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-md">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or company..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={mentors.length === 0 ? "No mentors available" : "No matching mentors"}
          description={
            mentors.length === 0 ? "Mentors added by your TPO will show up here." : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const hasRequested = requested.has(m.id);
            return (
              <Card key={m.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-600">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">
                        {m.designation} at {m.company}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.expertise.slice(0, 3).map((e) => (
                      <Badge key={e} variant="purple">
                        {e}
                      </Badge>
                    ))}
                  </div>
                  {m.availability && (
                    <p className="mt-2 text-xs text-slate-500">Availability: {m.availability}</p>
                  )}
                  <Button
                    size="sm"
                    variant={hasRequested ? "outline" : "default"}
                    className="mt-4 w-full"
                    disabled={hasRequested || requesting === m.id}
                    onClick={() => handleRequest(m.id)}
                  >
                    {hasRequested ? "Requested" : requesting === m.id ? "Sending..." : "Request Mentorship"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
