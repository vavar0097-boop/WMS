import { supabase } from "../../config/supabase";

export type LocationRow = {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  warehouse_id: string | null;
  parent_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

export class LocationRepository {
  async findAll(params?: {
    search?: string;
    warehouse_id?: string;
    location_type?: string;
    limit?: number;
  }): Promise<LocationRow[]> {
    const search = params?.search?.trim();
    const warehouseId = params?.warehouse_id?.trim();
    const locationType = params?.location_type?.trim();
    const limit = params?.limit ?? 200;

    let query = supabase
      .from("locations")
      .select(`
        id,
        location_code:code,
        location_name:name,
        location_type:level,
        warehouse_id,
        parent_id,
        is_active,
        created_at
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

    if (warehouseId) {
      query = query.eq("warehouse_id", warehouseId);
    }

    if (locationType) {
      query = query.eq("level", locationType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as LocationRow[];
  }
}