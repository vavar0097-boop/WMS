import { apiClient } from "@/shared/lib/api/client";

type UnknownRecord = Record<string, unknown>;

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: Pagination;
};

export type ItemRow = {
  id: string;
  item_code: string;
  item_name: string;
  item_type?: string | null;
  barcode?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  units?: {
    code?: string | null;
    name?: string | null;
  } | null;
};

export type WarehouseRow = {
  id: string;
  warehouse_code: string;
  warehouse_name: string;
  address?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

export type LocationRow = {
  id: string;
  location_code: string;
  location_name: string;
  location_type?: string | null;
  warehouse_id?: string | null;
  parent_id?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function unwrap(payload: unknown) {
  return isRecord(payload) && "data" in payload
    ? payload.data
    : payload;
}

function normalizePaginated<T>(
  payload: unknown,
): PaginatedResult<T> {
  const body = unwrap(payload);
  const result = isRecord(body) ? body : {};
  const rows = Array.isArray(result.data)
    ? (result.data as T[])
    : [];
  const rawPagination = isRecord(result.pagination)
    ? result.pagination
    : {};

  return {
    data: rows,
    pagination: {
      page: numberValue(rawPagination.page, 1),
      limit: numberValue(rawPagination.limit, rows.length || 20),
      total: numberValue(rawPagination.total, rows.length),
      totalPages: numberValue(
        rawPagination.totalPages,
        rows.length ? 1 : 0,
      ),
    },
  };
}

function normalizeArray<T>(payload: unknown): T[] {
  const body = unwrap(payload);

  if (Array.isArray(body)) {
    return body as T[];
  }

  if (!isRecord(body)) {
    return [];
  }

  for (const key of ["data", "items", "rows", "results"]) {
    const value = body[key];

    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}

export const masterDataPageService = {
  async getItems(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const response = await apiClient.get("/items", {
      params,
    });

    return normalizePaginated<ItemRow>(response.data);
  },

  async getWarehouses(params?: {
    search?: string;
    limit?: number;
  }) {
    const response = await apiClient.get("/warehouses", {
      params: {
        limit: params?.limit ?? 100,
        ...(params?.search ? { search: params.search } : {}),
      },
    });

    return normalizeArray<WarehouseRow>(response.data);
  },

  async getLocations(params?: {
    search?: string;
    warehouse_id?: string;
    location_type?: string;
    limit?: number;
  }) {
    const response = await apiClient.get("/locations", {
      params: {
        limit: params?.limit ?? 200,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.warehouse_id
          ? { warehouse_id: params.warehouse_id }
          : {}),
        ...(params?.location_type
          ? { location_type: params.location_type }
          : {}),
      },
    });

    return normalizeArray<LocationRow>(response.data);
  },
};
