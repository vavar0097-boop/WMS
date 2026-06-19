import { Menu, Search } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  WMS Dashboard
                </p>
                <p className="text-xs text-slate-500">
                  Transfer control panel
                </p>
              </div>
            </div>

            <div className="hidden w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search
                size={16}
                className="text-slate-400"
              />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search transfer, item, location..."
              />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              W
            </div>
          </div>
        </header>

        <div className="px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}