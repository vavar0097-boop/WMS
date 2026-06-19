import { LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toast } from "@/shared/ui/toast";
import { useAuthStore } from "@/stores/auth.store";

export function AppHeader() {
  const navigate = useNavigate();

  const { user, logout, isLoggingOut } = useAuthStore();

  const displayName =
    user?.username ||
    user?.name ||
    user?.full_name ||
    user?.email ||
    "WMS User";

  async function handleLogout() {
    try {
      await logout();

      toast.success(
        "Logged out",
        "You have been signed out successfully.",
      );

      navigate("/login", {
        replace: true,
      });
    } catch {
      toast.error(
        "Logout failed",
        "Please try again.",
      );
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            aria-label="Open navigation"
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

        <div className="hidden w-full max-w-xl items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search transfer, item, location..."
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-950">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role || "Operator"}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold uppercase text-white">
            {displayName.slice(0, 1)}
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}