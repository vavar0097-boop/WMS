import { supabase } from "../../config/supabase";

export type UnitRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
};

export class UnitRepository {
  async findAll(params?: {
    search?: string;
    limit?: number;
  }): Promise<UnitRow[]> {
    const search = params?.search?.trim();
    const limit = params?.limit ?? 100;

    let query = supabase
      .from("units")
      .select(`
        id,
        code,
        name,
        description,
        is_active
      `)
      .eq("is_active", true)
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

    return (data ?? []) as UnitRow[];
  }
}
