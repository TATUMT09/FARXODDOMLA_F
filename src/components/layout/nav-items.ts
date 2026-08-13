export interface NavItem {
  label: string;
  href: string;
  enabled: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Bosh sahifa", href: "/dashboard", enabled: true },
  { label: "O'quvchilar", href: "/dashboard/students", enabled: true },
  { label: "Guruhlar", href: "/dashboard/groups", enabled: true },
  { label: "Kurslar", href: "/dashboard/courses", enabled: true },
  { label: "O'qituvchilar", href: "/dashboard/teachers", enabled: true },
  { label: "Xodimlar", href: "/dashboard/employees", enabled: true },
  { label: "Foydalanuvchilar", href: "/dashboard/users", enabled: true },
  { label: "Davomat", href: "/dashboard/attendance", enabled: false },
  { label: "Moliya", href: "/dashboard/finance", enabled: false },
  { label: "To'lovlar", href: "/dashboard/payments", enabled: false },
  { label: "Qarzdorlar", href: "/dashboard/debtors", enabled: false },
  { label: "Online qabul", href: "/dashboard/admissions", enabled: false },
  { label: "Kameralar", href: "/dashboard/cameras", enabled: false },
  { label: "Hisobotlar", href: "/dashboard/reports", enabled: false },
  { label: "Sozlamalar", href: "/dashboard/settings", enabled: false },
];
