"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const item_controller_1 = require("../controllers/item.controller");
const router = (0, express_1.Router)();
const controller = new item_controller_1.ItemController();
router.get("/", auth_middleware_1.authMiddleware, controller.getAll);
router.get("/:id", auth_middleware_1.authMiddleware, controller.getById);
router.post("/", auth_middleware_1.authMiddleware, controller.create);
router.put("/:id", auth_middleware_1.authMiddleware, controller.update);
router.delete("/:id", auth_middleware_1.authMiddleware, controller.delete);
exports.default = router;
//# sourceMappingURL=item.route.js.map