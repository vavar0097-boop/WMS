import { useState } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { AppHeader } from "@/shared/layout/AppHeader";
import { AppSidebar } from "@/shared/layout/AppSidebar";
import { getSafePathForRole } from "@/shared/auth/role-home";
import { useAuthStore } from "@/stores/auth.store";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const role = useAuthStore((state) => state.user?.role);
  const safePath = getSafePathForRole(role, location.pathname);

  if (role && safePath !== location.pathname) {
    return (
      <Navigate
        to={safePath}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="flex min-h-screen">
        <AppSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onOpenMenu={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-x-hidden p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
