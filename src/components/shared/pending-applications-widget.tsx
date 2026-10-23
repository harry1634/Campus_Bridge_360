import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";

export function PendingApplicationsWidget({ count }: { count: number }) {
  return (
    <Link
      href="/tpo/applications"
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-teal-50/50 p-4 transition-colors hover:border-teal-200"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
        <ClipboardList className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {count > 0 ? `${count} pending review${count === 1 ? "" : "s"}` : "All caught up!"}
        </p>
        <p className="text-xs text-slate-500">
          {count > 0 ? "Applications awaiting a decision" : "No applications waiting"}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
    </Link>
  );
}
