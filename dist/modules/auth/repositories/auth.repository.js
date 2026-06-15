"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const client_1 = require("../../../database/client");
class AuthRepository {
    async findByUsername(username) {
        const { data, error } = await client_1.db
            .from("users")
            .select("*")
            .eq("username", username)
            .single();
        if (error) {
            return null;
        }
        return data;
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map