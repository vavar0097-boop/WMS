"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemQuerySchema = exports.updateItemSchema = exports.createItemSchema = void 0;
const zod_1 = require("zod");
const item_type_1 = require("../types/item.type");
const itemTypeEnum = zod_1.z.enum(item_type_1.ITEM_TYPES);
exports.createItemSchema = zod_1.z.object({
    item_name: zod_1.z
        .string()
        .trim()
        .min(3, "Item name minimum 3 characters")
        .max(100, "Item name maximum 100 characters"),
    item_type: itemTypeEnum,
    base_unit_id: zod_1.z.uuid(),
    barcode: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(1000)
        .optional(),
});
exports.updateItemSchema = zod_1.z.object({
    item_name: zod_1.z
        .string()
        .trim()
        .min(3)
        .max(100)
        .optional(),
    item_type: itemTypeEnum.optional(),
    base_unit_id: zod_1.z.uuid().optional(),
    barcode: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(1000)
        .optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.itemQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().trim().optional(),
});
//# sourceMappingURL=item.validator.js.map