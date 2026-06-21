import { Request, Response, NextFunction } from "express";

import { WarehouseService } from "./warehouse.service";

const warehouseService = new WarehouseService();

export class WarehouseController {
  async getWarehouses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : undefined;

      const limit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : undefined;

      const warehouses = await warehouseService.getWarehouses({
        search,
        limit,
      });

      res.status(200).json({
        success: true,
        message: "Warehouses retrieved successfully",
        data: warehouses,
      });
    } catch (error) {
      next(error);
    }
  }
}