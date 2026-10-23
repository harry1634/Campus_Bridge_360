"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { useMobileNav } from "@/components/layout/mobile-nav-context";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";

export function AppTopbar({
  userEmail,
  userName,
  role,
  searchPlaceholder = "Search...",
  notificationCount = 0,
}: {
  userEmail: string;
  userName?: string;
  role: "student" | "tpo";
  searchPlaceholder?: string;
  notificationCount?: number;
}) {
  const router = useRouter();
  const { toggle: toggleMobileNav } = useMobileNav();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  const displayName = userName ?? userEmail;
  const initial = displayName.charAt(0).toUpperCase();
  const profileHref = role === "student" ? "/student/profile" : "/tpo/dashboard";
  const settingsHref = role === "student" ? "/student/settings" : "/tpo/dashboard";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:px-8">
      <button
        type="button"
        onClick={toggleMobileNav}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 md:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 max-w-md items-center gap-2 rounded-lg border border-transparent bg-slate-50 px-3 py-2 transition-all focus-within:border-teal-200 focus-within:bg-white focus-within:shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 md:flex">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <span className="hidden shrink-0 items-center gap-0.5 lg:flex">
          <kbd className="flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 bg-white px-1 text-[10px] font-medium text-slate-500 shadow-[0_1px_0_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)]">
            ⌘
          </kbd>
          <kbd className="flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 bg-white px-1 text-[10px] font-medium text-slate-500 shadow-[0_1px_0_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)]">
            K
          </kbd>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative rounded-full">
          <Bell className="h-5 w-5 text-slate-500" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {notificationCount}
            </span>
          )}
        </Button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white ring-2 ring-white">
              {initial}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-medium leading-tight text-slate-900">{displayName}</span>
              <span className="text-xs text-slate-500 capitalize">{role}</span>
            </div>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform sm:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="animate-fade-in-up absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
              <div className="border-b border-slate-100 px-4 py-2.5">
                <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{userEmail}</p>
              </div>
              <Link
                href={profileHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-400" />
                {role === "student" ? "My Profile" : "Dashboard"}
              </Link>
              <Link
                href={settingsHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
