"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const response_1 = require("../../../utils/response");
const item_service_1 = require("../services/item.service");
const item_validator_1 = require("../validators/item.validator");
class ItemController {
    service = new item_service_1.ItemService();
    getAll = async (req, res) => {
        const query = item_validator_1.itemQuerySchema.parse(req.query);
        const result = await this.service.findMany(query);
        return (0, response_1.successResponse)(res, result, "Items fetched successfully");
    };
    getById = async (req, res) => {
        const item = await this.service.findById(String(req.params.id));
        return (0, response_1.successResponse)(res, item, "Item fetched successfully");
    };
    create = async (req, res) => {
        const dto = item_validator_1.createItemSchema.parse(req.body);
        const item = await this.service.create(dto);
        return (0, response_1.createdResponse)(res, item, "Item created successfully");
    };
    update = async (req, res) => {
        const dto = item_validator_1.updateItemSchema.parse(req.body);
        const item = await this.service.update(String(req.params.id), dto);
        return (0, response_1.successResponse)(res, item, "Item updated successfully");
    };
    delete = async (req, res) => {
        await this.service.delete(String(req.params.id));
        return (0, response_1.successResponse)(res, null, "Item deleted successfully");
    };
}
exports.ItemController = ItemController;
//# sourceMappingURL=item.controller.js.map