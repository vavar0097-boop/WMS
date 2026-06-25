import { ArrowLeftRight, Boxes, MapPin, Package, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  masterDataPageService,
} from "@/features/master-data/services/master-data-page.service";
import { stockService } from "@/features/stocks/services/stock.service";
import { transferService } from "@/features/transfers/services/transfer.service";
import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";

type Stat = {
  label: string;
  value: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
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
          locations,
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
          masterDataPageService.getLocations({
            limit: 200,
          }),
        ]);

        if (!mounted) return;

        setStats([
          {
            label: "Transfers",
            value: String(transfers.length),
            href: "/dashboard/transfers",
            icon: ArrowLeftRight,
          },
          {
            label: "Current Stock Rows",
            value: String(stocks.pagination.total),
            href: "/dashboard/stock",
            icon: Boxes,
          },
          {
            label: "Items",
            value: String(items.pagination.total),
            href: "/dashboard/items",
            icon: Package,
          },
          {
            label: "Warehouses",
            value: String(warehouses.length),
            href: "/dashboard/warehouses",
            icon: Warehouse,
          },
          {
            label: "Locations",
            value: String(locations.length),
            href: "/dashboard/locations",
            icon: MapPin,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Operational snapshot from active WMS modules.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))
          : stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.href}
                to={stat.href}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon size={20} />
                  </div>
                  <span className="text-3xl font-bold text-slate-950">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  {stat.label}
                </p>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
