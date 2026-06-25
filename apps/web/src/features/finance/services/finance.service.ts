import { apiClient } from "@/shared/lib/api/client";

type UnknownRecord = Record<string, unknown>;

export type FinanceTransaction = {
  id: string;
  transaction_date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string | null;
  amount: number | string;
  payment_method?: string | null;
};

export type CashierSettlement = {
  cashier_session_id: string;
  session_no: string;
  cashier_id: string;
  location_id: string;
  shift_name: string;
  status: string;
  opened_at: string;
  closed_at?: string | null;
  opening_cash: number | string;
  total_sales_count: number;
  total_sales: number | string;
  cash_sales: number | string;
  noncash_sales: number | string;
  total_expenses: number | string;
  total_deposits: number | string;
  calculated_expected_cash: number | string;
  actual_cash?: number | string | null;
  cash_difference?: number | string | null;
};

export type PosSaleFinanceRow = {
  id: string;
  sale_no: string;
  status: "PAID" | "VOIDED";
  payment_status: "PAID" | "REFUNDED";
  grand_total: number | string;
  created_at: string;
  cashier?: {
    username?: string | null;
    full_name?: string | null;
  } | null;
  location?: {
    code?: string | null;
    name?: string | null;
  } | null;
  sale_payments?: Array<{
    payment_method: "CASH" | "NONCASH";
    amount: number | string;
  }>;
  sale_items?: Array<{
    item_name_snapshot: string;
    quantity: number | string;
    subtotal: number | string;
  }>;
};

export type FinanceSummary = {
  income: number;
  expense: number;
  balance: number;
  transaction_count: number;
};

export type FinancePayload = {
  transaction_date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string | null;
  amount: number;
  payment_method?: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrap(payload: unknown) {
  return isRecord(payload) && "data" in payload
    ? payload.data
    : payload;
}

function normalizeArray<T>(payload: unknown): T[] {
  const body = unwrap(payload);

  return Array.isArray(body) ? (body as T[]) : [];
}

export const financeService = {
  async getTransactions(params?: {
    search?: string;
    type?: string;
    limit?: number;
  }) {
    const response = await apiClient.get("/finance/transactions", {
      params: {
        limit: params?.limit ?? 100,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.type ? { type: params.type } : {}),
      },
    });

    return normalizeArray<FinanceTransaction>(response.data);
  },

  async getSummary() {
    const response = await apiClient.get("/finance/summary");

    return unwrap(response.data) as FinanceSummary;
  },

  async createTransaction(payload: FinancePayload) {
    const response = await apiClient.post(
      "/finance/transactions",
      payload,
    );

    return response.data;
  },

  async updateTransaction(
    id: string,
    payload: FinancePayload,
  ) {
    const response = await apiClient.put(
      `/finance/transactions/${id}`,
      payload,
    );

    return response.data;
  },

  async deleteTransaction(id: string) {
    const response = await apiClient.delete(
      `/finance/transactions/${id}`,
    );

    return response.data;
  },

  async getCashierSettlements(params?: {
    status?: string;
    limit?: number;
  }) {
    const response = await apiClient.get(
      "/finance/cashier-settlements",
      {
        params: {
          limit: params?.limit ?? 100,
          ...(params?.status ? { status: params.status } : {}),
        },
      },
    );

    return normalizeArray<CashierSettlement>(response.data);
  },

  async getPosSales(params?: {
    status?: string;
    limit?: number;
  }) {
    const response = await apiClient.get("/finance/pos-sales", {
      params: {
        limit: params?.limit ?? 100,
        ...(params?.status ? { status: params.status } : {}),
      },
    });

    return normalizeArray<PosSaleFinanceRow>(response.data);
  },

  async voidPosSale(id: string, reason: string) {
    const response = await apiClient.post(`/pos/sales/${id}/void`, {
      reason,
    });

    return response.data;
  },
};
