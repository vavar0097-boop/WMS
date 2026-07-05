import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";
import {
  GlobalReport,
  globalReportService,
} from "../services/global-report.service";

const today = new Date().toISOString().slice(0, 10);
const defaultFrom = new Date(Date.now() - 29 * 86400000)
  .toISOString()
  .slice(0, 10);

function numberFormat(value: number | string) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

function sheetRows(report: GlobalReport | null) {
  return Object.entries(report?.sheets ?? {}).map(([name, rows]) => ({
    name,
    rows: Math.max(rows.length - 1, 0),
  }));
}

export function GlobalReportPage() {
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(today);
  const [syncGoogle, setSyncGoogle] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<GlobalReport | null>(null);
  const sheets = useMemo(() => sheetRows(report), [report]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dateFrom || !dateTo || dateFrom > dateTo) {
      toast.error(
        "Invalid report period",
        "Choose a valid date range before generating.",
      );
      return;
    }

    setIsGenerating(true);

    try {
      const nextReport = await globalReportService.generate({
        date_from: dateFrom,
        date_to: dateTo,
        sync_google: syncGoogle,
      });

      setReport(nextReport);
      toast.success(
        "Global report generated",
        nextReport.google.synced
          ? "Synced to Google Sheets."
          : nextReport.google.reason || "Report preview is ready.",
      );
    } catch (error) {
      toast.error(
        "Global report failed",
        getApiErrorMessage(error),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
            Reporting
          </p>
          <h1 className="text-2xl font-bold text-slate-950">
            Global Report
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Generate raw report tabs for the Google Sheet dashboard pivot.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleGenerate}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Date From
            </span>
            <span className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
              <CalendarDays size={17} className="text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                required
              />
            </span>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Date To
            </span>
            <span className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
              <CalendarDays size={17} className="text-slate-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                required
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={17} />
            )}
            Generate
          </button>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-3 py-3 text-sm font-semibold text-teal-900">
          <input
            type="checkbox"
            checked={syncGoogle}
            onChange={(event) => setSyncGoogle(event.target.checked)}
            className="h-4 w-4 accent-teal-700"
          />
          Sync to configured Google Sheet
        </label>
      </form>

      {report ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Sheets", report.summary.sheet_count],
              ["Sales", report.summary.sales_count],
              ["PO", report.summary.purchase_order_count],
              ["Stock Rows", report.summary.stock_rows],
              ["Finance Rows", report.summary.finance_transaction_count],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {numberFormat(value)}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <BarChart3 size={18} />
                  Generated Tabs
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {report.date_from} to {report.date_to}
                </p>
              </div>

              {report.google.spreadsheet_url ? (
                <a
                  href={report.google.spreadsheet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
                >
                  <ExternalLink size={16} />
                  Open Sheet
                </a>
              ) : null}
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
              {sheets.map((sheet) => (
                <div
                  key={sheet.name}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <p className="font-mono text-sm font-bold text-slate-900">
                    {sheet.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {numberFormat(sheet.rows)} data rows
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
          <div>
            <FileSpreadsheet className="mx-auto text-slate-400" size={34} />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              No global report generated yet.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
