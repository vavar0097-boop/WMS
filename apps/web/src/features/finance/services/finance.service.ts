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
};
