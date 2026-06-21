import { WarehouseRepository } from "./warehouse.repository";

const warehouseRepository = new WarehouseRepository();

export class WarehouseService {
  async getWarehouses(params?: {
    search?: string;
    limit?: number;
  }) {
    const warehouses =
      await warehouseRepository.findAll(params);

    return warehouses.map((warehouse) => ({
      id: warehouse.id,
      warehouse_code: warehouse.warehouse_code,
      warehouse_name: warehouse.warehouse_name,
      address: warehouse.address,
      is_active: warehouse.is_active ?? true,
      created_at: warehouse.created_at,
      updated_at: warehouse.updated_at,
    }));
  }
}