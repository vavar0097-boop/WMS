"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const stock_controller_1 = require("../controllers/stock.controller");
const async_handler_1 = require("../../../utils/async-handler");
const router = (0, express_1.Router)();
const controller = new stock_controller_1.StockController();
router.get("/current", auth_middleware_1.authMiddleware, controller.getCurrentStocks);
router.get("/ledgers", auth_middleware_1.authMiddleware, controller.getLedgers);
router.post("/initial", auth_middleware_1.authMiddleware, controller.createInitialStock);
router.post("/adjustment", auth_middleware_1.authMiddleware, controller.createAdjustment);
router.post("/adjustment", auth_middleware_1.authMiddleware, (0, async_handler_1.asyncHandler)(controller.createAdjustment));
exports.default = router;
//# sourceMappingURL=stock.route.js.map