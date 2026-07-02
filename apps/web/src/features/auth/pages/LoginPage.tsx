import { FormEvent, useState } from "react";
import {
  Boxes,
  Eye,
  EyeOff,
  Lock,
  User,
} from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/shared/lib/api/error";
import { Button } from "@/shared/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card/card";
import { Input } from "@/shared/ui/input/input";
import { toast } from "@/shared/ui/toast";
import { useAuthStore } from "@/stores/auth.store";
import {
  getHomePathForRole,
  getSafePathForRole,
} from "@/shared/auth/role-home";

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, isAuthenticated, isLoggingIn } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = getSafePathForRole(user?.role, state?.from);

  const canSubmit =
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    !isLoggingIn;

  if (isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      toast.error(
        "Login form incomplete",
        "Please input username and password.",
      );
      return;
    }

    try {
      const loggedInUser = await login({
        username: username.trim(),
        password,
      });

      toast.success(
        "Login success",
        "Welcome back to Enterprise WMS.",
      );

      navigate(getSafePathForRole(loggedInUser?.role, state?.from), {
        replace: true,
      });
    } catch (error) {
      toast.error(
        "Login failed",
        getApiErrorMessage(error),
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-950">
            <Boxes size={24} />
          </div>

          <div>
            <p className="text-lg font-bold">
              Enterprise WMS
            </p>
            <p className="text-sm text-slate-300">
              Warehouse Management System
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
            WMS + POS Control
          </p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight">
            Stock, sales, and reports in one clean workflow.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Monitor inventory, process cashier sales, track transfers, and read finance summaries from one focused dashboard.
          </p>
        </div>

        <div className="grid max-w-xl grid-cols-3 gap-3 text-sm">
          <div className="border-l border-cyan-300/70 pl-3">
            <p className="font-semibold text-white">Inventory</p>
            <p className="mt-1 text-slate-400">Stock movement stays visible.</p>
          </div>
          <div className="border-l border-cyan-300/70 pl-3">
            <p className="font-semibold text-white">POS</p>
            <p className="mt-1 text-slate-400">Sales flow stays fast.</p>
          </div>
          <div className="border-l border-cyan-300/70 pl-3">
            <p className="font-semibold text-white">Finance</p>
            <p className="mt-1 text-slate-400">Daily reports stay ready.</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-[520px]">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Boxes size={24} />
            </div>

            <div>
              <p className="text-lg font-bold text-slate-950">
                Enterprise WMS
              </p>
              <p className="text-sm text-slate-500">
                Warehouse Control
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Access your WMS dashboard, POS counter, stock control, and finance reports.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-4"
                onSubmit={handleSubmit}
                noValidate
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <Input
                      type="text"
                      value={username}
                      autoComplete="username"
                      placeholder="Enter your username"
                      className="pl-9"
                      disabled={isLoggingIn}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pl-9 pr-11"
                      disabled={isLoggingIn}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={isLoggingIn}
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                >
                  {isLoggingIn ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Built for daily warehouse work: quick access for admin, finance, and cashier teams.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
