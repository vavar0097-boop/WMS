import { FormEvent, useState } from "react";
import { Boxes, Lock, User } from "lucide-react";
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
import { getHomePathForRole } from "@/shared/auth/role-home";

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, isAuthenticated, isLoggingIn } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const state = location.state as LocationState | null;
  const redirectTo = state?.from || getHomePathForRole(user?.role);

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

      navigate(state?.from || getHomePathForRole(loggedInUser?.role), {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
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
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-400">
            Transfer Control
          </p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight">
            Manage stock transfers with controlled workflow.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Create draft, request, pick, dispatch, and receive warehouse transfer documents from one modern dashboard.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          Backend auth uses HTTP-only cookie access_token.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-[520px]">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
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
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Login to continue to WMS dashboard.
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
                      type="password"
                      value={password}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pl-9"
                      disabled={isLoggingIn}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                    />
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

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Login request will call{" "}
                <span className="font-semibold text-slate-700">
                  POST /api/auth/login
                </span>{" "}
                with payload username and password.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
