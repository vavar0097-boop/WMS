import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();

  const {
    isAuthenticated,
    isCheckingSession,
    checkSession,
  } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [checkSession, isAuthenticated]);

  if (isCheckingSession) {
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