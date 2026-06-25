import { BadRequestError } from "../../utils/errors";
import {
  PosMenuPayload,
  PosMenuRepository,
} from "./pos-menu.repository";

const repository = new PosMenuRepository();

function cleanPayload(payload: PosMenuPayload): PosMenuPayload {
  const menuCode = payload.menu_code?.trim();
  const menuName = payload.menu_name?.trim();
  const price = Number(payload.price);

  if (!menuCode || !menuName || !Number.isFinite(price) || price < 0) {
    throw new BadRequestError(
      "Menu code, name, and valid price are required",
    );
  }

  return {
    item_id: payload.item_id || null,
    menu_code: menuCode,
    menu_name: menuName,
    category: payload.category?.trim() || null,
    price,
    is_visible: payload.is_visible ?? true,
    is_available: payload.is_available ?? true,
    sort_order: Number(payload.sort_order ?? 0),
  };
}

export class PosMenuService {
  async getMenuItems(params?: {
    search?: string;
    visible_only?: boolean;
    limit?: number;
  }) {
    return repository.findAll(params);
  }

  async createMenuItem(payload: PosMenuPayload) {
    return repository.create(cleanPayload(payload));
  }

  async updateMenuItem(id: string, payload: PosMenuPayload) {
    return repository.update(id, cleanPayload(payload));
  }

  async deleteMenuItem(id: string) {
    await repository.delete(id);
  }
}
