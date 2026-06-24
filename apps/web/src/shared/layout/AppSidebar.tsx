import {
  ArrowLeftRight,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Package,
  Users,
  Warehouse,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  disabled?: boolean;
};

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    disabled: true,
  },
  {
    label: "Transfers",
    href: "/dashboard/transfers",
    icon: ArrowLeftRight,
  },
  {
    label: "Stock",
    href: "/dashboard/stock",
    icon: Boxes,
  },
  {
    label: "Items",
    href: "/dashboard/items",
    icon: Package,
    disabled: true,
  },
  {
    label: "Warehouses",
    href: "/dashboard/warehouses",
    icon: Warehouse,
    disabled: true,
  },
  {
    label: "Locations",
    href: "/dashboard/locations",
    icon: MapPin,
    disabled: true,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    disabled: true,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ClipboardList,
    disabled: true,
  },
];

export function AppSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-24 items-center gap-4 px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Warehouse size={24} />
        </div>

        <div>
          <p className="text-base font-bold text-slate-950">
            Enterprise WMS
          </p>
          <p className="text-sm text-slate-500">
            Warehouse Control
          </p>
        </div>
      </div>

      <nav className="space-y-2 px-4 py-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400"
                title="Coming soon"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
