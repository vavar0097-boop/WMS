"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const transfer_route_1 = __importDefault(require("./modules/transfers/routes/transfer.route"));
const logger_1 = require("./config/logger");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => {
            logger_1.logger.info(message.trim());
        },
    },
}));
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "WMS API Online",
    });
});
const error_middleware_1 = require("./middleware/error.middleware");
app.use(error_middleware_1.errorMiddleware);
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
app.use("/api/auth", auth_routes_1.default);
const item_route_1 = __importDefault(require("./modules/items/routes/item.route"));
app.use("/api/items", item_route_1.default);
const stock_route_1 = __importDefault(require("./modules/stocks/routes/stock.route"));
app.use("/api/stocks", stock_route_1.default);
app.use("/api/transfers", transfer_route_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map