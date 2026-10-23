"use client";

import * as React from "react";
import Link from "next/link";
import type { NotificationRecord } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationsList({ notifications }: { notifications: NotificationRecord[] }) {
  const [items, setItems] = React.useState(notifications);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="You'll be notified about application updates, new eligible jobs and placement announcements here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((n) => {
        const content = (
          <Card
            className={cn(
              "transition-colors",
              !n.read && "border-teal-200 bg-teal-50/40"
            )}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div
                className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  n.read ? "bg-slate-200" : "bg-teal-600"
                )}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-500">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </CardContent>
          </Card>
        );

        return (
          <div key={n.id} onClick={() => !n.read && markRead(n.id)}>
            {n.link ? <Link href={n.link}>{content}</Link> : content}
          </div>
        );
      })}
    </div>
  );
}
