"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const errors_1 = require("../../../utils/errors");
const item_repository_1 = require("../repositories/item.repository");
const item_type_1 = require("../types/item.type");
class ItemService {
    repository = new item_repository_1.ItemRepository();
    getPrefix(itemType) {
        return item_type_1.ITEM_PREFIX_MAP[itemType];
    }
    async create(dto) {
        const unit = await this.repository
            .findUnitById(dto.base_unit_id);
        if (!unit) {
            throw new errors_1.BadRequestError("Base unit not found");
        }
        if (dto.barcode) {
            const existing = await this.repository
                .findByBarcode(dto.barcode);
            if (existing) {
                throw new errors_1.BadRequestError("Barcode already exists");
            }
        }
        const prefix = this.getPrefix(dto.item_type);
        const itemCode = await this.repository
            .generateItemCode(prefix);
        return this.repository.create({
            item_code: itemCode,
            item_code_prefix: prefix,
            dto,
        });
    }
    async findById(id) {
        const item = await this.repository
            .findById(id);
        if (!item) {
            throw new errors_1.NotFoundError("Item not found");
        }
        return item;
    }
    async findMany(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const result = await this.repository
            .findMany(page, limit, query.search);
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
    async update(id, dto) {
        await this.findById(id);
        if (dto.base_unit_id) {
            const unit = await this.repository
                .findUnitById(dto.base_unit_id);
            if (!unit) {
                throw new errors_1.BadRequestError("Base unit not found");
            }
        }
        if (dto.barcode) {
            const existing = await this.repository
                .findByBarcode(dto.barcode);
            if (existing &&
                existing.id !== id) {
                throw new errors_1.BadRequestError("Barcode already exists");
            }
        }
        return this.repository.update(id, dto);
    }
    async delete(id) {
        await this.findById(id);
        await this.repository
            .softDelete(id);
        return true;
    }
}
exports.ItemService = ItemService;
//# sourceMappingURL=item.service.js.map