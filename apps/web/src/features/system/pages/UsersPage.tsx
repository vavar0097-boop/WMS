import { ShieldCheck, Users } from "lucide-react";

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          User and role administration workspace.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Users size={22} />
          </div>

          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-950">
              Backend route not wired yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Authentication is active and admin login works, but the API does
              not expose user management endpoints yet. This page is ready as
              the navigation target once user listing, invite, role assignment,
              and deactivate endpoints are added.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <ShieldCheck size={16} />
                  Suggested API scope
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  GET /api/users, POST /api/users, PATCH /api/users/:id,
                  and role assignment.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <ShieldCheck size={16} />
                  Current admin
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  The seeded admin account is available with role ADMIN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
