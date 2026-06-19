"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferActionSchema = exports.transferQuerySchema = exports.createTransferSchema = void 0;
const zod_1 = require("zod");
exports.createTransferSchema = zod_1.z.object({
    source_warehouse_id: zod_1.z
        .string()
        .uuid("Source warehouse is invalid"),
    destination_warehouse_id: zod_1.z
        .string()
        .uuid("Destination warehouse is invalid"),
    source_location_id: zod_1.z
        .string()
        .uuid("Source location is invalid"),
    destination_location_id: zod_1.z
        .string()
        .uuid("Destination location is invalid"),
    remarks: zod_1.z
        .string()
        .trim()
        .max(500)
        .optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        item_id: zod_1.z
            .string()
            .uuid("Item is invalid"),
        qty_requested: zod_1.z
            .number()
            .positive("Quantity must be greater than zero"),
    }))
        .min(1, "At least one item is required"),
})
    .refine((data) => data.source_location_id !==
    data.destination_location_id, {
    message: "Source and destination location cannot be the same",
    path: ["destination_location_id"],
});
exports.transferQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(20),
    search: zod_1.z
        .string()
        .trim()
        .optional(),
    status: zod_1.z
        .enum([
        "DRAFT",
        "REQUESTED",
        "PICKED",
        "IN_TRANSIT",
        "RECEIVED",
        "CANCELLED",
    ])
        .optional(),
});
exports.transferActionSchema = zod_1.z.object({
    remarks: zod_1.z
        .string()
        .trim()
        .max(500)
        .optional(),
});
//# sourceMappingURL=transfer.validator.js.map