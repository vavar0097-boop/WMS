import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toast } from "@/shared/ui/toast";
import { useAuthStore } from "@/stores/auth.store";

type AppHeaderProps = {
  onOpenMenu: () => void;
};

export function AppHeader({ onOpenMenu }: AppHeaderProps) {
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
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700 transition hover:bg-teal-100 lg:hidden"
            onClick={onOpenMenu}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-sm font-semibold text-slate-950">
              WMS Dashboard
            </p>
            <p className="text-xs text-teal-700">
              Live warehouse operations
            </p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search size={16} />
            <span>Search modules, stock, transfers</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-700 transition hover:bg-amber-100 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>

          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-950">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role || "Operator"}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-sm font-semibold uppercase text-white shadow-sm">
            {displayName.slice(0, 1)}
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
