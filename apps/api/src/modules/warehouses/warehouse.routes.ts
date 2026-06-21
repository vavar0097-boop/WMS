import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { WarehouseController } from "./warehouse.controller";

const router = Router();

const warehouseController = new WarehouseController();

router.get(
  "/",
  authMiddleware,
  warehouseController.getWarehouses.bind(warehouseController),
);

export default router;