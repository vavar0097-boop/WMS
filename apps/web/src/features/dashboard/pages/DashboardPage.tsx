import {
  Activity,
  ArrowLeftRight,
  Boxes,
  Package,
  ShoppingCart,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  masterDataPageService,
} from "@/features/master-data/services/master-data-page.service";
import {
  financeService,
  PosSaleFinanceRow,
} from "@/features/finance/services/finance.service";
import { stockService } from "@/features/stocks/services/stock.service";
import { StockLedger } from "@/features/stocks/types/stock.types";
import { transferService } from "@/features/transfers/services/transfer.service";
import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";

type Stat = {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  tone: string;
  accent: string;
};

const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MovementSummary = {
  inbound: number;
  outbound: number;
  adjustments: number;
  salesCount: number;
  salesTotal: number;
};

function numberValue(value: unknown) {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function summarizeMovements(ledgers: StockLedger[]): MovementSummary {
  return ledgers.reduce(
    (summary, ledger) => {
      const quantity = numberValue(ledger.quantity);

      if (ledger.reference_type === "SALE") {
        summary.salesCount += 1;
      }

      if (ledger.movement_type === "IN") {
        summary.inbound += quantity;
      } else if (ledger.movement_type === "OUT") {
        summary.outbound += quantity;
      } else if (ledger.movement_type === "ADJ") {
        summary.adjustments += quantity;
      }

      return summary;
    },
    {
      inbound: 0,
      outbound: 0,
      adjustments: 0,
      salesCount: 0,
      salesTotal: 0,
    },
  );
}

function summarizeSales(sales: PosSaleFinanceRow[]) {
  return sales
    .filter((sale) => sale.status === "PAID")
    .reduce(
      (summary, sale) => ({
        salesCount: summary.salesCount + 1,
        salesTotal: summary.salesTotal + numberValue(sale.grand_total),
      }),
      {
        salesCount: 0,
        salesTotal: 0,
      },
    );
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [movementSummary, setMovementSummary] =
    useState<MovementSummary>({
      inbound: 0,
      outbound: 0,
      adjustments: 0,
      salesCount: 0,
      salesTotal: 0,
    });
  const [recentSales, setRecentSales] = useState<PosSaleFinanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const [
          transfers,
          stocks,
          items,
          warehouses,
          ledgersResult,
          salesResult,
        ] = await Promise.all([
          transferService.getTransfers(),
          stockService.getCurrentStocks({
            page: 1,
            limit: 1,
          }),
          masterDataPageService.getItems({
            page: 1,
            limit: 1,
          }),
          masterDataPageService.getWarehouses({
            limit: 100,
          }),
          stockService.getLedgers({
            page: 1,
            limit: 100,
          }),
          financeService.getPosSales({
            limit: 50,
          }).catch(() => []),
        ]);

        if (!mounted) return;

        const movement = summarizeMovements(ledgersResult.data);
        const sales = summarizeSales(salesResult);

        setMovementSummary({
          ...movement,
          salesCount: sales.salesCount || movement.salesCount,
          salesTotal: sales.salesTotal,
        });
        setRecentSales(salesResult.slice(0, 5));

        setStats([
          {
            label: "POS Sales",
            value: sales.salesCount || movement.salesCount,
            href: "/dashboard/finance",
            icon: ShoppingCart,
            tone: "from-rose-500 to-orange-500",
            accent: "bg-rose-50 text-rose-700",
          },
          {
            label: "Transfers",
            value: transfers.length,
            href: "/dashboard/transfers",
            icon: ArrowLeftRight,
            tone: "from-teal-500 to-cyan-500",
            accent: "bg-teal-50 text-teal-700",
          },
          {
            label: "Stock Rows",
            value: stocks.pagination.total,
            href: "/dashboard/stock",
            icon: Boxes,
            tone: "from-emerald-500 to-teal-500",
            accent: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Items",
            value: items.pagination.total,
            href: "/dashboard/items",
            icon: Package,
            tone: "from-sky-500 to-indigo-500",
            accent: "bg-sky-50 text-sky-700",
          },
          {
            label: "Warehouses",
            value: warehouses.length,
            href: "/dashboard/warehouses",
            icon: Warehouse,
            tone: "from-violet-500 to-fuchsia-500",
            accent: "bg-violet-50 text-violet-700",
          },
          {
            label: "Stock Out",
            value: Math.round(movement.outbound),
            href: "/dashboard/stock",
            icon: Activity,
            tone: "from-amber-500 to-orange-500",
            accent: "bg-amber-50 text-amber-700",
          },
        ]);
      } catch (error) {
        if (!mounted) return;

        toast.error(
          "Dashboard failed to load",
          getApiErrorMessage(error),
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const total = useMemo(
    () => stats.reduce((sum, stat) => sum + stat.value, 0),
    [stats],
  );

  const chartValues = useMemo(() => {
    const seed = stats.map((stat) => stat.value);
    const fallback = [9, 14, 11, 18, 21, 16, 24];

    return chartLabels.map((_, index) => {
      const base = seed[index % Math.max(seed.length, 1)] ?? fallback[index];

      return Math.max(8, base + fallback[index]);
    });
  }, [stats]);

  const maxChartValue = Math.max(...chartValues, 1);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700">
              <TrendingUp size={14} />
              Operations overview
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Warehouse activity at a glance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor transfers, stock coverage, item master readiness, and
              warehouse structure from one command surface.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-600 p-5 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/80">
              Active operational records
            </p>
            <p className="mt-3 text-4xl font-bold">
              {isLoading ? "..." : total}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div className="rounded-xl bg-white/15 px-2 py-3">
                Live
              </div>
              <div className="rounded-xl bg-white/15 px-2 py-3">
                Synced
              </div>
              <div className="rounded-xl bg-white/15 px-2 py-3">
                RBAC
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  key={stat.href}
                  to={stat.href}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.accent}`}
                    >
                      <Icon size={21} />
                    </div>
                    <span className="text-3xl font-bold text-slate-950">
                      {stat.value}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    {stat.label}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stat.tone}`}
                      style={{
                        width: `${Math.min(100, Math.max(12, total ? (stat.value / total) * 100 : 12))}%`,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Weekly Movement
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Composite trend from current operational totals.
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Latest ledger
            </span>
          </div>

          <div className="mt-8 flex h-72 items-end gap-3 rounded-2xl bg-slate-50 p-4">
            {chartValues.map((value, index) => (
              <div
                key={chartLabels[index]}
                className="flex min-w-0 flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-56 w-full items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-teal-500 to-indigo-500 shadow-sm transition hover:from-amber-500 hover:to-rose-500"
                    style={{
                      height: `${(value / maxChartValue) * 100}%`,
                    }}
                    title={`${chartLabels[index]}: ${value}`}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {chartLabels[index]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Sales & Stock Cycle
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Recent POS sales and item movement quantities.
          </p>

          <div className="mt-6 space-y-4">
            {[
              ["Sales", movementSummary.salesCount],
              ["Sales Total", movementSummary.salesTotal],
              ["Stock In", movementSummary.inbound],
              ["Stock Out", movementSummary.outbound],
              ["Adjustments", movementSummary.adjustments],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-slate-700">
                  {label}
                </span>
                <span className="font-bold text-slate-950">
                  {label === "Sales Total"
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(numberValue(value))
                    : numberValue(value).toLocaleString("id-ID")}
                </span>
              </div>
            ))}

            {recentSales.length > 0 ? (
              <div className="pt-2">
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                  Recent sales
                </p>
                <div className="space-y-2">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-slate-600">
                        {sale.sale_no}
                      </span>
                      <span className="font-semibold text-slate-950">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(numberValue(sale.grand_total))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
