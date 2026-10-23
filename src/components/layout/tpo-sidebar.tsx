"use client";

import * as React from "react";
import { SidebarNav, MobileSidebarDrawer } from "./sidebar-nav";
import { tpoNavGroups } from "./nav-config";
import { PendingApplicationsWidget } from "@/components/shared/pending-applications-widget";

export function TpoSidebar({ pendingApplications = 0 }: { pendingApplications?: number }) {
  const groups = React.useMemo(
    () =>
      tpoNavGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.href === "/tpo/applications" && pendingApplications > 0
            ? { ...item, badge: pendingApplications }
            : item
        ),
      })),
    [pendingApplications]
  );

  const footer = <PendingApplicationsWidget count={pendingApplications} />;

  return (
    <>
      <SidebarNav groups={groups} brandLabel="TPO Portal" footer={footer} />
      <MobileSidebarDrawer groups={groups} brandLabel="TPO Portal" footer={footer} />
    </>
  );
}
