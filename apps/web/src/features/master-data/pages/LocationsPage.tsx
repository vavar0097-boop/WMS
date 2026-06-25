import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MasterDataShell } from "../components/MasterDataShell";
import { StatusPill } from "../components/StatusPill";
import {
  LocationRow,
  WarehouseRow,
  masterDataPageService,
} from "../services/master-data-page.service";
import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";

export function LocationsPage() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const warehouseMap = useMemo(
    () =>
      new Map(
        warehouses.map((warehouse) => [
          warehouse.id,
          warehouse.warehouse_name,
        ]),
      ),
    [warehouses],
  );

  useEffect(() => {
    let mounted = true;

    async function loadWarehouses() {
      try {
        const rows = await masterDataPageService.getWarehouses({
          limit: 100,
        });

        if (mounted) {
          setWarehouses(rows);
        }
      } catch {
        if (mounted) {
          setWarehouses([]);
        }
      }
    }

    loadWarehouses();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadLocations() {
      setIsLoading(true);

      try {
        const rows = await masterDataPageService.getLocations({
          limit: 200,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(warehouseId ? { warehouse_id: warehouseId } : {}),
        });

        if (!mounted) return;

        setLocations(rows);
      } catch (error) {
        if (!mounted) return;

        toast.error(
          "Locations failed to load",
          getApiErrorMessage(error),
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadLocations, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search, warehouseId]);

  return (
    <MasterDataShell
      title="Locations"
      description="Browse bins, areas, and warehouse locations available for stock movement."
    >
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative w-full md:w-80">
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

            <select
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouse_code} - {warehouse.warehouse_name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {locations.length} locations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Code
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Warehouse
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Loading locations...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No locations found.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">
                      {location.location_code}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-950">
                      {location.location_name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {location.location_type || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {location.warehouse_id
                        ? warehouseMap.get(location.warehouse_id) ||
                          location.warehouse_id
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusPill active={location.is_active} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MasterDataShell>
  );
}
