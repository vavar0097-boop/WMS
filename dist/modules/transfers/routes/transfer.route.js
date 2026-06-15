"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfer_controller_1 = require("../controllers/transfer.controller");
const router = (0, express_1.Router)();
const controller = new transfer_controller_1.TransferController();
router.get("/", controller.findMany);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.post("/:id/request", controller.request);
router.post("/:id/pick", controller.pick);
router.post("/:id/dispatch", controller.dispatch);
router.post("/:id/receive", controller.receive);
router.post("/:id/cancel", controller.cancel);
exports.default = router;
//# sourceMappingURL=transfer.route.js.map