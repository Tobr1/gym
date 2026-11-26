import {
  LayoutDashboard,
  Users,
  ScanLine,
  CalendarDays,
  Dumbbell,
  Wallet,
  KanbanSquare,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: string };

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Operación",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/socios", label: "Socios", icon: Users },
      { href: "/admin/acceso", label: "Control de acceso", icon: ScanLine, badge: "EN VIVO" },
      { href: "/admin/clases", label: "Clases", icon: CalendarDays },
      { href: "/admin/rutinas", label: "Rutinas", icon: Dumbbell },
    ],
  },
  {
    group: "Negocio",
    items: [
      { href: "/admin/caja", label: "Caja y cobranzas", icon: Wallet, badge: "12" },
      { href: "/admin/crm", label: "CRM", icon: KanbanSquare },
      { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
    ],
  },
  {
    group: "Sistema",
    items: [{ href: "/admin/configuracion", label: "Configuración", icon: Settings }],
  },
];
