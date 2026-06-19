"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const transfer_controller_1 = require("../controllers/transfer.controller");
const router = (0, express_1.Router)();
const controller = new transfer_controller_1.TransferController();
router.get("/", auth_middleware_1.authMiddleware, controller.findMany);
router.get("/:id", auth_middleware_1.authMiddleware, controller.findById);
router.post("/", auth_middleware_1.authMiddleware, controller.create);
router.post("/:id/request", auth_middleware_1.authMiddleware, controller.request);
router.post("/:id/pick", auth_middleware_1.authMiddleware, controller.pick);
router.post("/:id/dispatch", auth_middleware_1.authMiddleware, controller.dispatch);
router.post("/:id/receive", auth_middleware_1.authMiddleware, controller.receive);
router.post("/:id/cancel", auth_middleware_1.authMiddleware, controller.cancel);
exports.default = router;
//# sourceMappingURL=transfer.route.js.map