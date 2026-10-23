import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgressRing } from "./progress-ring";

export function ProfileCompletionWidget({ percentage }: { percentage: number }) {
  const isHigh = percentage >= 80;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-teal-50/50 p-4">
      <div className="flex items-center gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <ProgressRing
            percentage={percentage}
            size={56}
            strokeWidth={5}
            colorFrom={isHigh ? "#059669" : "#0d9488"}
            colorTo="#0891b2"
          />
          <span className="absolute text-xs font-bold text-slate-900">{percentage}%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {isHigh ? "Almost there!" : "Profile Completion"}
          </p>
          <p className="text-xs text-slate-500">
            Complete your profile for better opportunities.
          </p>
        </div>
      </div>
      <Link href="/student/profile">
        <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline">
          Complete Now
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </div>
  );
}
