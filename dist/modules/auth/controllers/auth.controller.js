"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../../../utils/response");
const errors_1 = require("../../../utils/errors");
class AuthController {
    service = new auth_service_1.AuthService();
    login = async (req, res) => {
        const { username, password, } = req.body;
        const result = await this.service.login({
            username,
            password,
        });
        res.cookie("access_token", result.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        res.cookie("refresh_token", result.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        return (0, response_1.successResponse)(res, {
            id: result.user.id,
            username: result.user.username,
        }, "Login successful");
    };
    me = async (req, res) => {
        return (0, response_1.successResponse)(res, req.user, "Current User");
    };
    logout = async (_req, res) => {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return (0, response_1.successResponse)(res, null, "Logout successful");
    };
    refresh = async (req, res) => {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            throw new errors_1.UnauthorizedError("Refresh token missing");
        }
        const accessToken = this.service.refresh(refreshToken);
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        return (0, response_1.successResponse)(res, null, "Token refreshed");
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map