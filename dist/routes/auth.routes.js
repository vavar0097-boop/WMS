"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_controller_1 = require("../modules/auth/controllers/auth.controller");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
router.get("/me", auth_middleware_1.authMiddleware, controller.me);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/refresh", controller.refresh);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map