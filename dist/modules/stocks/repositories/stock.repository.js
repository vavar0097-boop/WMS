"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockRepository = void 0;
const client_1 = require("../../../database/client");
const errors_1 = require("../../../utils/errors");
class StockRepository {
    async getCurrentStocks(page, limit, itemId, locationId) {
        let query = client_1.db
            .from("current_stocks")
            .select(`
        *,
        items(
          id,
          item_code,
          item_name,
          item_type
        ),
        locations(
          id,
          code,
          name
        )
      `, {
            count: "exact",
        });
        if (itemId) {
            query = query.eq("item_id", itemId);
        }
        if (locationId) {
            query = query.eq("location_id", locationId);
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
    async getLedgers(page, limit, itemId, locationId) {
        let query = client_1.db
            .from("stock_ledgers")
            .select(`
        *,
        items(
          id,
          item_code,
          item_name
        ),
        locations(
          id,
          code,
          name
        )
      `, {
            count: "exact",
        });
        if (itemId) {
            query = query.eq("item_id", itemId);
        }
        if (locationId) {
            query = query.eq("location_id", locationId);
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
    async createStockMovement(params) {
        const { data, error, } = await client_1.db.rpc("create_stock_movement", {
            p_item_id: params.item_id,
            p_location_id: params.location_id,
            p_movement_type: params.movement_type,
            p_quantity: params.quantity,
            p_reference_type: params.reference_type,
            p_reference_id: params.reference_id,
            p_reference_no: params.reference_no,
            p_remarks: params.remarks,
            p_created_by: params.created_by,
            p_stock_effect: params.stock_effect ??
                "PLUS",
        });
        if (error) {
            throw new errors_1.BadRequestError(error.message ||
                "Stock movement failed");
        }
        return data;
    }
    async getCurrentStock(itemId, locationId) {
        const { data, error, } = await client_1.db
            .from("current_stocks")
            .select("quantity")
            .eq("item_id", itemId)
            .eq("location_id", locationId)
            .maybeSingle();
        if (error) {
            throw error;
        }
        return data?.quantity ?? 0;
    }
}
exports.StockRepository = StockRepository;
//# sourceMappingURL=stock.repository.js.map