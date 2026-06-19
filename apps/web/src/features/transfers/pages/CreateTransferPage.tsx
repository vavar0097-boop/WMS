import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "@/shared/ui/toast";

import { masterDataService } from "../services/master-data.service";
import { useTransferStore } from "../stores/transfer.store";
import type {
  ItemOption,
  LocationOption,
  WarehouseOption,
} from "../types/transfer.types";

type FormItem = {
  item_id: string;
  qty_requested: number;
};

function warehouseLabel(warehouse: WarehouseOption) {
  return (
    warehouse.code ||
    warehouse.warehouse_code ||
    warehouse.name ||
    warehouse.warehouse_name ||
    warehouse.id
  );
}

function locationLabel(location: LocationOption) {
  return (
    location.code ||
    location.location_code ||
    location.name ||
    location.location_name ||
    location.id
  );
}

function itemLabel(item: ItemOption) {
  const code = item.item_code || "";
  const name = item.item_name || item.name || item.id;
  const unit = item.unit_code || item.unit_name || "";

  return `${code ? `${code} - ` : ""}${name}${unit ? ` (${unit})` : ""}`;
}

export function CreateTransferPage() {
  const navigate = useNavigate();
  const { createTransfer, creating } = useTransferStore();

  const [warehouses, setWarehouses] = useState<WarehouseOption[]>(
    [],
  );
  const [locations, setLocations] = useState<LocationOption[]>(
    [],
  );
  const [items, setItems] = useState<ItemOption[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [
    sourceWarehouseId,
    setSourceWarehouseId,
  ] = useState("");
  const [
    destinationWarehouseId,
    setDestinationWarehouseId,
  ] = useState("");
  const [
    sourceLocationId,
    setSourceLocationId,
  ] = useState("");
  const [
    destinationLocationId,
    setDestinationLocationId,
  ] = useState("");
  const [remarks, setRemarks] = useState("");

  const [formItems, setFormItems] = useState<FormItem[]>([
    {
      item_id: "",
      qty_requested: 1,
    },
  ]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoadingMaster(true);

        const [
          warehouseResult,
          locationResult,
          itemResult,
        ] = await Promise.all([
          masterDataService.getWarehouses(),
          masterDataService.getLocations(),
          masterDataService.getItems(),
        ]);

        setWarehouses(warehouseResult.data);
        setLocations(locationResult.data);
        setItems(itemResult.data);

        setUsingFallback(
          warehouseResult.usingFallback ||
            locationResult.usingFallback ||
            itemResult.usingFallback,
        );

        const firstWarehouse = warehouseResult.data[0];
        const firstSourceLocation = locationResult.data[0];
        const firstDestinationLocation =
          locationResult.data[1] || locationResult.data[0];
        const firstItem = itemResult.data[0];

        if (firstWarehouse) {
          setSourceWarehouseId(firstWarehouse.id);
          setDestinationWarehouseId(firstWarehouse.id);
        }

        if (firstSourceLocation) {
          setSourceLocationId(firstSourceLocation.id);
        }

        if (firstDestinationLocation) {
          setDestinationLocationId(firstDestinationLocation.id);
        }

        if (firstItem) {
          setFormItems([
            {
              item_id: firstItem.id,
              qty_requested: 1,
            },
          ]);
        }
      } catch (error) {
        toast.error(
          "Failed to load master data",
          getApiErrorMessage(error),
        );
      } finally {
        setLoadingMaster(false);
      }
    }

    loadMasterData();
  }, []);

  const sourceLocations = useMemo(() => {
    const filtered = locations.filter(
      (location) =>
        !location.warehouse_id ||
        location.warehouse_id === sourceWarehouseId,
    );

    return filtered.length > 0 ? filtered : locations;
  }, [locations, sourceWarehouseId]);

  const destinationLocations = useMemo(() => {
    const filtered = locations.filter(
      (location) =>
        !location.warehouse_id ||
        location.warehouse_id === destinationWarehouseId,
    );

    return filtered.length > 0 ? filtered : locations;
  }, [locations, destinationWarehouseId]);

  const hasSameLocation =
    Boolean(sourceLocationId) &&
    sourceLocationId === destinationLocationId;

  const hasValidItems = formItems.every(
    (item) =>
      Boolean(item.item_id) &&
      Number(item.qty_requested) > 0,
  );

  const canSubmit =
    Boolean(sourceWarehouseId) &&
    Boolean(destinationWarehouseId) &&
    Boolean(sourceLocationId) &&
    Boolean(destinationLocationId) &&
    !hasSameLocation &&
    hasValidItems &&
    !creating &&
    !loadingMaster;

  function updateItem(
    index: number,
    nextValue: Partial<FormItem>,
  ) {
    setFormItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...nextValue,
            }
          : item,
      ),
    );
  }

  function addItemRow() {
    setFormItems((current) => [
      ...current,
      {
        item_id: items[0]?.id || "",
        qty_requested: 1,
      },
    ]);
  }

  function removeItemRow(index: number) {
    setFormItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      if (hasSameLocation) {
        toast.error(
          "Invalid transfer",
          "Source location and destination location cannot be the same.",
        );
      }

      return;
    }

    try {
      const transfer = await createTransfer({
        source_warehouse_id: sourceWarehouseId,
        destination_warehouse_id: destinationWarehouseId,
        source_location_id: sourceLocationId,
        destination_location_id: destinationLocationId,
        remarks: remarks.trim() || undefined,
        items: formItems.map((item) => ({
          item_id: item.item_id,
          qty_requested: Number(item.qty_requested),
        })),
      });

      toast.success(
        "Transfer created",
        "Draft transfer has been created successfully.",
      );

      if (transfer?.id) {
        navigate(`/dashboard/transfers/${transfer.id}`);
      } else {
        navigate("/dashboard/transfers");
      }
    } catch (error) {
      toast.error(
        "Failed to create transfer",
        getApiErrorMessage(error),
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            to="/dashboard/transfers"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to transfers
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Create Transfer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a draft transfer document before request, pick, dispatch, and receive.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
        >
          {creating ? "Creating..." : "Create Draft"}
        </Button>
      </div>

      {usingFallback ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          Temporary dev fallback is active because one or more master-data endpoints are not ready.
          This fallback only runs in development mode and can be disabled with
          {" "}
          <span className="font-semibold">
            VITE_ENABLE_DEV_FALLBACK=false
          </span>
          .
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Route</CardTitle>
              <CardDescription>
                Select source and destination warehouse location.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Source Warehouse
                </label>
                <Select
                  value={sourceWarehouseId}
                  disabled={loadingMaster}
                  onChange={(event) =>
                    setSourceWarehouseId(event.target.value)
                  }
                >
                  <option value="">Select source warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouseLabel(warehouse)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Destination Warehouse
                </label>
                <Select
                  value={destinationWarehouseId}
                  disabled={loadingMaster}
                  onChange={(event) =>
                    setDestinationWarehouseId(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select destination warehouse
                  </option>
                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouseLabel(warehouse)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Source Location
                </label>
                <Select
                  value={sourceLocationId}
                  disabled={loadingMaster}
                  onChange={(event) =>
                    setSourceLocationId(event.target.value)
                  }
                >
                  <option value="">Select source location</option>
                  {sourceLocations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {locationLabel(location)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Destination Location
                </label>
                <Select
                  value={destinationLocationId}
                  disabled={loadingMaster}
                  onChange={(event) =>
                    setDestinationLocationId(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select destination location
                  </option>
                  {destinationLocations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {locationLabel(location)}
                    </option>
                  ))}
                </Select>

                {hasSameLocation ? (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    Source and destination location cannot be the same.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Add items and requested quantity.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {formItems.map((item, index) => (
                <div
                  key={`${index}-${item.item_id}`}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_44px]"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Item
                    </label>
                    <Select
                      value={item.item_id}
                      disabled={loadingMaster}
                      onChange={(event) =>
                        updateItem(index, {
                          item_id: event.target.value,
                        })
                      }
                    >
                      <option value="">Select item</option>
                      {items.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {itemLabel(option)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Qty Requested
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={item.qty_requested}
                      onChange={(event) =>
                        updateItem(index, {
                          qty_requested: Number(
                            event.target.value,
                          ),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 px-0"
                      disabled={formItems.length === 1}
                      onClick={() => removeItemRow(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItemRow}
              >
                <Plus size={16} />
                Add Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
            <CardDescription>
              Optional internal note for this transfer.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Textarea
              value={remarks}
              placeholder="Example: Transfer Ayam Fillet from BIN-01 to BIN-02"
              onChange={(event) =>
                setRemarks(event.target.value)
              }
            />

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Flow Preview
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>DRAFT → REQUESTED</p>
                <p>REQUESTED → PICKED</p>
                <p>PICKED → IN_TRANSIT</p>
                <p>IN_TRANSIT → RECEIVED</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
