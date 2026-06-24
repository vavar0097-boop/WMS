import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../utils/async-handler";
import { StockController } from "../controllers/stock.controller";

const router = Router();
const controller = new StockController();

router.get(
  "/current",
  authMiddleware,
  asyncHandler(controller.getCurrentStocks),
);

router.get(
  "/ledgers",
  authMiddleware,
  asyncHandler(controller.getLedgers),
);

router.post(
  "/initial",
  authMiddleware,
  asyncHandler(controller.createInitialStock),
);

router.post(
  "/adjustment",
  authMiddleware,
  asyncHandler(controller.createAdjustment),
);

export default router;
