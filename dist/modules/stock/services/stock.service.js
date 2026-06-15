"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const stock_repository_1 = require("../repositories/stock.repository");
class StockService {
    repository = new stock_repository_1.StockRepository();
    async getCurrentStocks(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const result = await this.repository
            .getCurrentStocks(page, limit, query.item_id, query.location_id);
        return {
            data: result.data,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total /
                    limit),
            },
        };
    }
    async getLedgers(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const result = await this.repository
            .getLedgers(page, limit, query.item_id, query.location_id);
        return {
            data: result.data,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total /
                    limit),
            },
        };
    }
    async createInitialStock(dto, user) {
        return this.repository
            .createStockMovement({
            item_id: dto.item_id,
            location_id: dto.location_id,
            movement_type: "IN",
            quantity: dto.quantity,
            reference_type: "INITIAL_STOCK",
            reference_id: null,
            reference_no: null,
            remarks: dto.remarks ?? null,
            created_by: user.id,
        });
    }
    async createAdjustment(dto, user) {
        return this.repository
            .createStockMovement({
            item_id: dto.item_id,
            location_id: dto.location_id,
            movement_type: "ADJ",
            quantity: dto.quantity,
            reference_type: "ADJUSTMENT",
            reference_id: null,
            reference_no: null,
            remarks: dto.remarks ?? null,
            created_by: user.id,
            stock_effect: dto.stock_effect,
        });
    }
}
exports.StockService = StockService;
//# sourceMappingURL=stock.service.js.map