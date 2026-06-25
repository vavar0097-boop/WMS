import { supabase } from "../../config/supabase";

export type FinanceTransactionPayload = {
  transaction_date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string | null;
  amount: number;
  payment_method?: string | null;
};

export class FinanceRepository {
  async findAll(params?: {
    search?: string;
    type?: string;
    limit?: number;
  }) {
    const search = params?.search?.trim();
    const limit = params?.limit ?? 100;

    let query = supabase
      .from("finance_transactions")
      .select("*")
      .order("transaction_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (params?.type) {
      query = query.eq("type", params.type);
    }

    if (search) {
      query = query.or(
        `category.ilike.%${search}%,description.ilike.%${search}%,payment_method.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ?? [];
  }

  async create(payload: FinanceTransactionPayload) {
    const { data, error } = await supabase
      .from("finance_transactions")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    payload: Partial<FinanceTransactionPayload>,
  ) {
    const { data, error } = await supabase
      .from("finance_transactions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async findCashierSettlements(params?: {
    status?: string;
    limit?: number;
  }) {
    const limit = params?.limit ?? 100;

    let query = supabase
      .from("v_cashier_session_summary")
      .select("*")
      .order("opened_at", {
        ascending: false,
      })
      .limit(limit);

    if (params?.status) {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ?? [];
  }

  async findPosSales(params?: {
    status?: string;
    limit?: number;
  }) {
    const limit = params?.limit ?? 100;

    let query = supabase
      .from("sales")
      .select(`
        *,
        sale_payments (*),
        sale_items (*),
        cashier:cashier_id (
          username,
          full_name
        ),
        location:location_id (
          code,
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (params?.status) {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ?? [];
  }
}
