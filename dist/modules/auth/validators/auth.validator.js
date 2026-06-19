"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Username minimum 3 characters"),
    password: zod_1.z
        .string()
        .min(4, "Password minimum 4 characters"),
});
//# sourceMappingURL=auth.validator.js.map