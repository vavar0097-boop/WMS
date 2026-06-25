import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { MasterDataShell } from "../components/MasterDataShell";
import { StatusPill } from "../components/StatusPill";
import {
  ItemRow,
  Pagination,
  masterDataPageService,
} from "../services/master-data-page.service";
import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";

const initialPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function ItemsPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [pagination, setPagination] =
    useState(initialPagination);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      setIsLoading(true);

      try {
        const result = await masterDataPageService.getItems({
          page: 1,
          limit: 20,
          ...(search.trim() ? { search: search.trim() } : {}),
        });

        if (!mounted) return;

        setItems(result.data);
        setPagination(result.pagination);
      } catch (error) {
        if (!mounted) return;

        toast.error(
          "Items failed to load",
          getApiErrorMessage(error),
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadItems, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <MasterDataShell
      title="Items"
      description="Browse active inventory master items and unit assignments."
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
              placeholder="Search code, name, or barcode"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            {pagination.total} items
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
                  Item
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unit
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
                    Loading items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">
                      {item.item_code}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-950">
                        {item.item_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.barcode || "No barcode"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {item.item_type || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {item.units?.code || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusPill active={item.is_active} />
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
