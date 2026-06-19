"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const client_1 = require("../../../database/client");
class ItemRepository {
    async generateItemCode(prefix) {
        const { data, error } = await client_1.db.rpc("generate_item_code", {
            p_prefix: prefix,
        });
        if (error) {
            throw error;
        }
        return data;
    }
    async findUnitById(unitId) {
        const { data } = await client_1.db
            .from("units")
            .select("*")
            .eq("id", unitId)
            .eq("is_active", true)
            .single();
        return data;
    }
    async findById(id) {
        const { data } = await client_1.db
            .from("items")
            .select(`
        *,
        units(
          id,
          code,
          name
        )
      `)
            .eq("id", id)
            .eq("is_deleted", false)
            .single();
        return data;
    }
    async findByBarcode(barcode) {
        const { data } = await client_1.db
            .from("items")
            .select("*")
            .eq("barcode", barcode)
            .eq("is_deleted", false)
            .maybeSingle();
        return data;
    }
    async create(payload) {
        const { data, error } = await client_1.db
            .from("items")
            .insert({
            item_code: payload.item_code,
            item_code_prefix: payload.item_code_prefix,
            item_name: payload.dto.item_name,
            item_type: payload.dto.item_type,
            base_unit_id: payload.dto.base_unit_id,
            barcode: payload.dto.barcode ?? null,
            description: payload.dto.description ?? null,
        })
            .select()
            .single();
        if (error) {
            throw error;
        }
        return data;
    }
    async update(id, dto) {
        const { data, error } = await client_1.db
            .from("items")
            .update(dto)
            .eq("id", id)
            .eq("is_deleted", false)
            .select()
            .single();
        if (error) {
            throw error;
        }
        return data;
    }
    async softDelete(id) {
        const { error } = await client_1.db
            .from("items")
            .update({
            is_deleted: true,
            deleted_at: new Date().toISOString(),
        })
            .eq("id", id);
        if (error) {
            throw error;
        }
    }
    async findMany(page, limit, search) {
        let query = client_1.db
            .from("items")
            .select(`
        *,
        units(
          id,
          code,
          name
        )
      `, {
            count: "exact",
        })
            .eq("is_deleted", false);
        if (search) {
            query = query.or([
                `item_code.ilike.%${search}%`,
                `item_name.ilike.%${search}%`,
                `barcode.ilike.%${search}%`,
            ].join(","));
        }
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, count, error, } = await query.range(from, to);
        if (error) {
            throw error;
        }
        return {
            data,
            total: count ?? 0,
        };
    }
}
exports.ItemRepository = ItemRepository;
//# sourceMappingURL=item.repository.js.map