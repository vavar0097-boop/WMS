"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockAdjustmentSchema = exports.createInitialStockSchema = exports.stockQuerySchema = void 0;
const zod_1 = require("zod");
exports.stockQuerySchema = zod_1.z.object({
    item_id: zod_1.z.string()
        .uuid()
        .optional(),
    location_id: zod_1.z.string()
        .uuid()
        .optional(),
    page: zod_1.z.coerce.number()
        .int()
        .min(1)
        .default(1),
    limit: zod_1.z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
});
exports.createInitialStockSchema = zod_1.z.object({
    item_id: zod_1.z.string().uuid(),
    location_id: zod_1.z.string().uuid(),
    quantity: zod_1.z.number()
        .positive(),
    remarks: zod_1.z.string()
        .max(1000)
        .optional(),
});
exports.createStockAdjustmentSchema = zod_1.z.object({
    item_id: zod_1.z.string().uuid(),
    location_id: zod_1.z.string().uuid(),
    quantity: zod_1.z.number()
        .positive(),
    stock_effect: zod_1.z.enum([
        "PLUS",
        "MINUS",
    ]),
    remarks: zod_1.z.string()
        .max(1000)
        .optional(),
});
//# sourceMappingURL=stock.validator.js.map