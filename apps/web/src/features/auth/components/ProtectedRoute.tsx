import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";
import { toast } from "@/shared/ui/toast";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    isCheckingSession,
    hasCheckedSession,
    checkSession,
    clearSession,
  } = useAuthStore();

  useEffect(() => {
    if (!hasCheckedSession && !isCheckingSession) {
      checkSession();
    }
  }, [checkSession, hasCheckedSession, isCheckingSession]);

  useEffect(() => {
    function handleAuthExpired() {
      clearSession();

      toast.error(
        "Session expired",
        "Please sign in again to continue.",
      );

      navigate("/login", {
        replace: true,
        state: {
          from: location.pathname,
        },
      });
    }

    window.addEventListener(
      "wms:auth-expired",
      handleAuthExpired,
    );

    return () => {
      window.removeEventListener(
        "wms:auth-expired",
        handleAuthExpired,
      );
    };
  }, [clearSession, location.pathname, navigate]);

  if (isCheckingSession || !hasCheckedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-soft">
          <p className="text-sm font-semibold text-slate-950">
            Checking session...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Please wait while we validate your login session.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}