"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileNav } from "./mobile-nav-context";
import type { NavGroup, NavItem } from "./nav-config";

/**
 * Picks the single best-matching nav item for the current pathname. A plain
 * per-item `pathname.startsWith(item.href)` check would mark both "Students"
 * (/tpo/students) and "Import Data" (/tpo/students/import) active at once,
 * since the former is a prefix of the latter — so instead we find the
 * longest href across every item that actually matches, and only that one
 * wins.
 */
function useActiveHref(groups: NavGroup[], pathname: string | null) {
  return React.useMemo(() => {
    if (!pathname) return null;
    const allItems: NavItem[] = groups.flatMap((g) => g.items);
    let best: string | null = null;
    for (const item of allItems) {
      const matches = pathname === item.href || pathname.startsWith(item.href + "/");
      if (matches && (!best || item.href.length > best.length)) {
        best = item.href;
      }
    }
    return best;
  }, [groups, pathname]);
}

function SidebarContent({
  groups,
  brandLabel,
  footer,
  onNavigate,
}: {
  groups: NavGroup[];
  brandLabel: string;
  footer?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = useActiveHref(groups, pathname);
  const activeGroupLabel = React.useMemo(
    () => groups.find((g) => g.items.some((i) => i.href === activeHref))?.label,
    [groups, activeHref]
  );

  // Collapsed-group preferences persist per portal (Student vs TPO) so a
  // long nav (many groups) doesn't stay clumsily fully-expanded forever.
  // The group containing the current page is always force-expanded,
  // regardless of the stored preference, so navigation never hides itself.
  const storageKey = `cb360-sidebar-collapsed-${brandLabel}`;
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setCollapsed(JSON.parse(stored));
    } catch {
      // ignore malformed/unavailable storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function toggleGroup(label: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm">
          CB
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">
            Campus <span className="text-emerald-600">Bridge</span> 360
          </p>
          <p className="text-xs text-slate-500">{brandLabel}</p>
        </div>
      </div>
      <div className="mx-6 h-px bg-slate-100" />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="px-3 py-5 space-y-2">
          {groups.map((group, gi) => {
            const isCollapsed = !!group.label && group.label !== activeGroupLabel && !!collapsed[group.label];
            return (
              <div key={group.label ?? gi} className="py-2">
                {group.label ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label!)}
                    className="mb-1 flex w-full items-center justify-between rounded-lg px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {group.label}
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform", isCollapsed ? "-rotate-90" : "")}
                    />
                  </button>
                ) : null}
                {!isCollapsed && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = item.href === activeHref;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group relative flex items-center justify-between rounded-xl py-2.5 pl-4 pr-3 text-sm font-medium transition-all duration-150",
                            active
                              ? "bg-emerald-50 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(5,150,105,0.12)]"
                              : "text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {active && (
                            <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-emerald-600" />
                          )}
                          <span className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                                active
                                  ? "bg-white text-emerald-600 shadow-sm"
                                  : "text-slate-400 group-hover:bg-white group-hover:text-slate-600 group-hover:shadow-sm"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                            </span>
                            {item.label}
                          </span>
                          {!!item.badge && (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                active ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {footer && (
          <div className="mx-3 mt-4 mb-4 border-t border-slate-200 pt-4">{footer}</div>
        )}
      </div>
    </>
  );
}

export function SidebarNav({
  groups,
  brandLabel,
  footer,
}: {
  groups: NavGroup[];
  brandLabel: string;
  footer?: React.ReactNode;
}) {
  return (
    <aside
      className="hidden md:flex md:w-72 md:flex-col border-r border-slate-200 bg-white"
      style={{ boxShadow: "6px 0 24px -12px rgba(15,23,42,0.06)" }}
    >
      <SidebarContent groups={groups} brandLabel={brandLabel} footer={footer} />
    </aside>
  );
}

/**
 * Mobile-only slide-in drawer holding the same nav content. Without this,
 * the sidebar (hidden below the `md` breakpoint) left phone users with no
 * way to navigate between pages at all — the topbar's hamburger button
 * previously didn't open anything.
 */
export function MobileSidebarDrawer({
  groups,
  brandLabel,
  footer,
}: {
  groups: NavGroup[];
  brandLabel: string;
  footer?: React.ReactNode;
}) {
  const { open, close } = useMobileNav();

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={close} aria-hidden="true" />
      <div className="animate-fade-in-up absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent groups={groups} brandLabel={brandLabel} footer={footer} onNavigate={close} />
      </div>
    </div>
  );
}
