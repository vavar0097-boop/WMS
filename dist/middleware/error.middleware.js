"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const errors_1 = require("../utils/errors");
const logger_1 = require("../config/logger");
function errorMiddleware(err, _req, res, _next) {
    logger_1.logger.error(err);
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    if (err instanceof Error) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}
//# sourceMappingURL=error.middleware.js.map