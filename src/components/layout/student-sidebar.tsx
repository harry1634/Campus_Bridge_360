"use client";

import { SidebarNav, MobileSidebarDrawer } from "./sidebar-nav";
import { studentNavGroups } from "./nav-config";
import { ProfileCompletionWidget } from "@/components/shared/profile-completion-widget";

export function StudentSidebar({ profileCompletion }: { profileCompletion: number }) {
  const footer = <ProfileCompletionWidget percentage={profileCompletion} />;

  return (
    <>
      <SidebarNav groups={studentNavGroups} brandLabel="Student Portal" footer={footer} />
      <MobileSidebarDrawer groups={studentNavGroups} brandLabel="Student Portal" footer={footer} />
    </>
  );
}
