import { supabase } from "../../config/supabase";

export type PosMenuPayload = {
  item_id?: string | null;
  menu_code: string;
  menu_name: string;
  category?: string | null;
  price: number;
  is_visible?: boolean;
  is_available?: boolean;
  sort_order?: number;
};

export class PosMenuRepository {
  async findAll(params?: {
    search?: string;
    visible_only?: boolean;
    limit?: number;
  }) {
    const search = params?.search?.trim();
    const limit = params?.limit ?? 200;

    let query = supabase
      .from("pos_menu_items")
      .select(`
        *,
        items (
          id,
          item_code,
          item_name
        )
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("menu_name", {
        ascending: true,
      })
      .limit(limit);

    if (params?.visible_only) {
      query = query.eq("is_visible", true);
    }

    if (search) {
      query = query.or(
        `menu_code.ilike.%${search}%,menu_name.ilike.%${search}%,category.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return data ?? [];
  }

  async create(payload: PosMenuPayload) {
    const { data, error } = await supabase
      .from("pos_menu_items")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(id: string, payload: Partial<PosMenuPayload>) {
    const { data, error } = await supabase
      .from("pos_menu_items")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from("pos_menu_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
