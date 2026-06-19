"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = roleMiddleware;
const errors_1 = require("../utils/errors");
function roleMiddleware(...allowedRoles) {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role ||
            !allowedRoles.includes(role)) {
            throw new errors_1.ForbiddenError("Access denied");
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map