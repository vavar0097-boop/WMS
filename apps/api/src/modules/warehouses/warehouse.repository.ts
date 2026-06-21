import { supabase } from "../../config/supabase";

export type WarehouseRow = {
  id: string;
  warehouse_code: string;
  warehouse_name: string;
  address: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export class WarehouseRepository {
  async findAll(params?: {
    search?: string;
    limit?: number;
  }): Promise<WarehouseRow[]> {
    const search = params?.search?.trim();
    const limit = params?.limit ?? 100;

    let query = supabase
      .from("warehouses")
      .select(`
        id,
        warehouse_code:code,
        warehouse_name:name,
        address,
        is_active,
        created_at,
        updated_at
      `)
      .order("code", {
        ascending: true,
      })
      .limit(limit);

    if (search) {
      query = query.or(
        `code.ilike.%${search}%,name.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as WarehouseRow[];
  }
}