import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { MasterDataShell } from "../components/MasterDataShell";
import { StatusPill } from "../components/StatusPill";
import {
  WarehouseRow,
  masterDataPageService,
} from "../services/master-data-page.service";
import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWarehouses() {
      setIsLoading(true);

      try {
        const rows = await masterDataPageService.getWarehouses({
          limit: 100,
          ...(search.trim() ? { search: search.trim() } : {}),
        });

        if (!mounted) return;

        setWarehouses(rows);
      } catch (error) {
        if (!mounted) return;

        toast.error(
          "Warehouses failed to load",
          getApiErrorMessage(error),
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadWarehouses, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <MasterDataShell
      title="Warehouses"
      description="Review warehouse master data used by transfers and stock."
    >
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search code or name"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            {warehouses.length} warehouses
          </p>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
              />
            ))
          ) : warehouses.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No warehouses found.
            </div>
          ) : (
            warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {warehouse.warehouse_code}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-800">
                      {warehouse.warehouse_name}
                    </h2>
                  </div>
                  <StatusPill active={warehouse.is_active} />
                </div>

                <p className="mt-4 min-h-10 text-sm text-slate-500">
                  {warehouse.address || "No address recorded."}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </MasterDataShell>
  );
}
