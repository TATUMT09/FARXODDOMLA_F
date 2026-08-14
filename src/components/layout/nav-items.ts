import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Camera,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  GraduationCap,
  Home,
  Inbox,
  Settings,
  UserCog,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  enabled: boolean;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Bosh sahifa", href: "/dashboard", enabled: true, icon: Home },
  { label: "O'quvchilar", href: "/dashboard/students", enabled: true, icon: Users },
  { label: "Guruhlar", href: "/dashboard/groups", enabled: true, icon: UsersRound },
  { label: "Kurslar", href: "/dashboard/courses", enabled: true, icon: BookOpen },
  { label: "O'qituvchilar", href: "/dashboard/teachers", enabled: true, icon: GraduationCap },
  { label: "Xodimlar", href: "/dashboard/employees", enabled: true, icon: Briefcase },
  { label: "Foydalanuvchilar", href: "/dashboard/users", enabled: true, icon: UserCog },
  { label: "Davomat", href: "/dashboard/attendance", enabled: false, icon: ClipboardCheck },
  { label: "Moliya", href: "/dashboard/finance", enabled: false, icon: Wallet },
  { label: "To'lovlar", href: "/dashboard/payments", enabled: false, icon: CreditCard },
  { label: "Qarzdorlar", href: "/dashboard/debtors", enabled: false, icon: AlertCircle },
  { label: "Online qabul", href: "/dashboard/admissions", enabled: false, icon: Inbox },
  { label: "Kameralar", href: "/dashboard/cameras", enabled: false, icon: Camera },
  { label: "Hisobotlar", href: "/dashboard/reports", enabled: false, icon: FileBarChart },
  { label: "Sozlamalar", href: "/dashboard/settings", enabled: false, icon: Settings },
];
