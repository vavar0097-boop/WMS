import { Router } from "express";

import {
  authMiddleware,
} from "../../../middleware/auth.middleware";

import {
  StockController,
} from "../controllers/stock.controller";

import {
  asyncHandler,
} from "../../../utils/async-handler";

const router = Router();

const controller =
  new StockController();

router.get(
  "/current",
  authMiddleware,
  controller.getCurrentStocks
);

router.get(
  "/ledgers",
  authMiddleware,
  controller.getLedgers
);

router.post(
  "/initial",
  authMiddleware,
  controller.createInitialStock
);

router.post(
  "/adjustment",
  authMiddleware,
  controller.createAdjustment
);

router.post(
  "/adjustment",
  authMiddleware,
  asyncHandler(
    controller.createAdjustment
  )
);

export default router;