"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { ACADEMIC_CYCLES, resolveCycle } from "@/lib/business/academic-cycle";

function AcademicCycleSelectInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const current = resolveCycle(searchParams.get("cycle"));

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCycle(label: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cycle", label);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/40"
      >
        <Calendar className="h-4 w-4 text-teal-600" />
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-fade-in-up absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <p className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Academic Cycle
          </p>
          {ACADEMIC_CYCLES.map((cycle) => (
            <button
              key={cycle.label}
              type="button"
              onClick={() => selectCycle(cycle.label)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {cycle.label}
              {cycle.label === current.label && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            </button>
          ))}
          <div className="mt-1 border-t border-slate-100 px-3 pt-2">
            <p className="text-[11px] leading-snug text-slate-400">
              Filters students by graduation year, and jobs/drives by targeted batch.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AcademicCycleSelect() {
  return (
    <React.Suspense fallback={null}>
      <AcademicCycleSelectInner />
    </React.Suspense>
  );
}
