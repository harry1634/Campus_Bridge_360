"use client";

import * as React from "react";

interface MobileNavContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileNavContext = React.createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const value = React.useMemo<MobileNavContextValue>(
    () => ({ open, toggle: () => setOpen((o) => !o), close: () => setOpen(false) }),
    [open]
  );

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const ctx = React.useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav must be used within a MobileNavProvider");
  return ctx;
}
