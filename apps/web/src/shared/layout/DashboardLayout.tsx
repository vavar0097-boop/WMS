import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AppHeader } from "@/shared/layout/AppHeader";
import { AppSidebar } from "@/shared/layout/AppSidebar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
