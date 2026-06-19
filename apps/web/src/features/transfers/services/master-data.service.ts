import { apiClient } from "@/shared/lib/api/client";

import type {
  ItemOption,
  LocationOption,
  MasterDataResult,
  WarehouseOption,
} from "../types/transfer.types";

const enableDevFallback =
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_DEV_FALLBACK !== "false";

const devWarehouses: WarehouseOption[] = [
  {
    id: "18c3c71d-9a8d-480a-a25a-bf1f3bacbf5a",
    code: "WH-MAIN",
    warehouse_code: "WH-MAIN",
    name: "Main Warehouse",
    warehouse_name: "Main Warehouse",
  },
];

const devLocations: LocationOption[] = [
  {
    id: "1818fce4-36f3-42f1-a95e-d0171ee01ac3",
    code: "BIN-01",
    location_code: "BIN-01",
    name: "BIN-01",
    location_name: "BIN-01",
    warehouse_id: "18c3c71d-9a8d-480a-a25a-bf1f3bacbf5a",
  },
  {
    id: "4e2d7d4e-c9b9-4e33-aa79-9634f5e91485",
    code: "BIN-02",
    location_code: "BIN-02",
    name: "BIN-02",
    location_name: "BIN-02",
    warehouse_id: "18c3c71d-9a8d-480a-a25a-bf1f3bacbf5a",
  },
];

const devItems: ItemOption[] = [
  {
    id: "78f96246-f642-4aad-9538-2fe790ec85fd",
    item_code: "RAW-000001",
    item_name: "Ayam Fillet",
    unit_name: "Kg",
    unit_code: "KG",
  },
];

function unwrapApiPayload<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function normalizeArray<T>(
  payload: unknown,
  keys: string[],
): T[] {
  const unwrapped = unwrapApiPayload<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (unwrapped && typeof unwrapped === "object") {
    const value = unwrapped as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(value[key])) {
        return value[key] as T[];
      }
    }

    if (Array.isArray(value.rows)) {
      return value.rows as T[];
    }

    if (Array.isArray(value.items)) {
      return value.items as T[];
    }
  }

  return [];
}

function result<T>(
  data: T,
  usingFallback: boolean,
): MasterDataResult<T> {
  return {
    data,
    usingFallback,
  };
}

async function requestMasterData<T>(
  endpoint: string,
  keys: string[],
): Promise<T[]> {
  const response = await apiClient.get(endpoint);

  return normalizeArray<T>(response.data, keys);
}

export const masterDataService = {
  async getWarehouses(): Promise<MasterDataResult<WarehouseOption[]>> {
    if (enableDevFallback) {
      return result(devWarehouses, true);
    }

    const data = await requestMasterData<WarehouseOption>(
      "/warehouses",
      ["warehouses"],
    );

    return result(data, false);
  },

  async getLocations(): Promise<MasterDataResult<LocationOption[]>> {
    if (enableDevFallback) {
      return result(devLocations, true);
    }

    const data = await requestMasterData<LocationOption>(
      "/locations",
      ["locations"],
    );

    return result(data, false);
  },

  async getItems(): Promise<MasterDataResult<ItemOption[]>> {
    if (enableDevFallback) {
      return result(devItems, true);
    }

    const data = await requestMasterData<ItemOption>(
      "/items",
      ["items"],
    );

    return result(data, false);
  },
};