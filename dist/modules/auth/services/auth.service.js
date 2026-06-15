"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../config/env");
const errors_1 = require("../../../utils/errors");
const auth_repository_1 = require("../repositories/auth.repository");
class AuthService {
    repository = new auth_repository_1.AuthRepository();
    async login({ username, password }) {
        const user = await this.repository.findByUsername(username);
        if (!user) {
            throw new errors_1.UnauthorizedError("Invalid credentials");
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid) {
            throw new errors_1.UnauthorizedError("Invalid credentials");
        }
        const accessToken = jsonwebtoken_1.default.sign({
            sub: user.id,
            username: user.username,
            role: user.role_name ?? "OPERATOR",
        }, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({
            sub: user.id,
        }, env_1.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    refresh(refreshToken) {
        const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        return jsonwebtoken_1.default.sign({
            sub: payload.sub,
        }, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: "15m",
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map