import {
  LayoutDashboard,
  UserCircle,
  Briefcase,
  Sparkles,
  ClipboardList,
  Building2,
  GraduationCap,
  Users,
  FileText,
  Bell,
  Settings,
  Users2,
  UsersRound,
  BarChart3,
  Target,
  FileBarChart,
  Megaphone,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const studentNavGroups: NavGroup[] = [
  {
    label: "Career",
    items: [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Profile", href: "/student/profile", icon: UserCircle },
      { label: "Eligible Jobs", href: "/student/jobs/eligible", icon: Briefcase },
      { label: "Recommended Jobs", href: "/student/jobs/recommended", icon: Sparkles },
      { label: "Resume & Job Match", href: "/student/resume-match", icon: FileText },
    ],
  },
  {
    label: "Placement",
    items: [
      { label: "My Applications", href: "/student/applications", icon: ClipboardList },
      { label: "Placement Drives", href: "/student/drives", icon: Building2 },
      { label: "Placement Exams", href: "/student/exams", icon: GraduationCap },
      { label: "Placement Updates", href: "/student/updates", icon: Megaphone },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Alumni", href: "/student/alumni", icon: Users },
      { label: "Mentors", href: "/student/mentors", icon: Users2 },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/student/notifications", icon: Bell },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },
];

export const tpoNavGroups: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/tpo/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Placement Data",
    items: [
      { label: "Students", href: "/tpo/students", icon: Users },
      { label: "Import Data", href: "/tpo/students/import", icon: FileText },
      { label: "Companies", href: "/tpo/companies", icon: Building2 },
      { label: "Jobs", href: "/tpo/jobs", icon: Briefcase },
      { label: "Placement Drives", href: "/tpo/drives", icon: Building2 },
      { label: "Placement Exams", href: "/tpo/exams", icon: GraduationCap },
      { label: "Applications", href: "/tpo/applications", icon: ClipboardList },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Alumni", href: "/tpo/alumni", icon: Users },
      { label: "Mentors", href: "/tpo/mentors", icon: UsersRound },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/tpo/analytics", icon: BarChart3 },
      { label: "Skill Gaps", href: "/tpo/skill-gaps", icon: Target },
      { label: "Reports", href: "/tpo/reports", icon: FileBarChart },
      { label: "Placement Updates", href: "/tpo/updates", icon: Megaphone },
    ],
  },
  {
    label: "Admin",
    items: [{ label: "Team", href: "/tpo/team", icon: UserPlus }],
  },
];
