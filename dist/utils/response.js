"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.createdResponse = createdResponse;
function successResponse(res, data, message = "Success") {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
}
function createdResponse(res, data, message = "Created") {
    return res.status(201).json({
        success: true,
        message,
        data,
    });
}
//# sourceMappingURL=response.js.map