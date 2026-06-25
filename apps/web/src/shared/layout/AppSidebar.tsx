import {
  ArrowLeftRight,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Package,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

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
  },
  {
    label: "Warehouses",
    href: "/dashboard/warehouses",
    icon: Warehouse,
  },
  {
    label: "Locations",
    href: "/dashboard/locations",
    icon: MapPin,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ClipboardList,
  },
];

type AppSidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function AppSidebar({
  open = false,
  onClose,
}: AppSidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:block lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between gap-4 px-5 lg:h-24 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Warehouse size={22} />
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

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4 lg:px-4 lg:py-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400"
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
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
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
    </>
  );
}
