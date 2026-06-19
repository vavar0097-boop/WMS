"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockController = void 0;
const response_1 = require("../../../utils/response");
const stock_service_1 = require("../services/stock.service");
const stock_validator_1 = require("../validators/stock.validator");
class StockController {
    service = new stock_service_1.StockService();
    getCurrentStocks = async (req, res) => {
        const query = stock_validator_1.stockQuerySchema.parse(req.query);
        const result = await this.service
            .getCurrentStocks(query);
        return (0, response_1.successResponse)(res, result, "Current stocks fetched successfully");
    };
    getLedgers = async (req, res) => {
        const query = stock_validator_1.stockQuerySchema.parse(req.query);
        const result = await this.service
            .getLedgers(query);
        return (0, response_1.successResponse)(res, result, "Stock ledgers fetched successfully");
    };
    createInitialStock = async (req, res) => {
        const dto = stock_validator_1.createInitialStockSchema.parse(req.body);
        const result = await this.service
            .createInitialStock(dto, req.user);
        return (0, response_1.createdResponse)(res, result, "Initial stock created successfully");
    };
    createAdjustment = async (req, res) => {
        const dto = stock_validator_1.createStockAdjustmentSchema.parse(req.body);
        const result = await this.service
            .createAdjustment(dto, req.user);
        return (0, response_1.createdResponse)(res, result, "Stock adjustment created successfully");
    };
}
exports.StockController = StockController;
//# sourceMappingURL=stock.controller.js.map