import { ClipboardList, Database } from "lucide-react";

export function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Audit Logs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Activity history and operational traceability.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            <ClipboardList size={22} />
          </div>

          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-950">
              Audit UI is routed, API is next
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The database migrations include audit-related structures, but
              the Express app does not expose an audit log route yet. This
              page gives the sidebar a real destination while keeping the
              missing backend work explicit.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Database size={16} />
                Suggested API scope
              </div>
              <p className="mt-2 text-sm text-slate-500">
                GET /api/audit-logs with filters for module, action, user,
                reference id, and date range.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
