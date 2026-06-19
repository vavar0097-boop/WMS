"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function authMiddleware(req, _res, next) {
    const token = req.cookies?.access_token;
    if (!token) {
        throw new errors_1.UnauthorizedError("Access token missing");
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        req.user = {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
        next();
    }
    catch {
        throw new errors_1.UnauthorizedError("Invalid token");
    }
}
//# sourceMappingURL=auth.middleware.js.map