import { Outlet } from "react-router-dom";

import { AppHeader } from "@/shared/layout/AppHeader";
import { AppSidebar } from "@/shared/layout/AppSidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />

          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}