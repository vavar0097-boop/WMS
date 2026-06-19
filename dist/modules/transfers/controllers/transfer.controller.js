"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferController = void 0;
const transfer_service_1 = require("../services/transfer.service");
class TransferController {
    service;
    constructor(service = new transfer_service_1.TransferService()) {
        this.service = service;
    }
    create = async (req, res) => {
        const result = await this.service.create(req.body, req.user);
        res.status(201).json(result);
    };
    findMany = async (req, res) => {
        const result = await this.service.findMany(req.query);
        res.json(result);
    };
    findById = async (req, res) => {
        const result = await this.service.findById(String(req.params.id));
        res.json(result);
    };
    request = async (req, res) => {
        const result = await this.service.request(String(req.params.id), req.body, req.user);
        res.json(result);
    };
    pick = async (req, res) => {
        const result = await this.service.pick(String(req.params.id), req.body, req.user);
        res.json(result);
    };
    dispatch = async (req, res) => {
        const result = await this.service.dispatch(String(req.params.id), req.body, req.user);
        res.json(result);
    };
    receive = async (req, res) => {
        const result = await this.service.receive(String(req.params.id), req.body, req.user);
        res.json(result);
    };
    cancel = async (req, res) => {
        const result = await this.service.cancel(String(req.params.id), req.body, req.user);
        res.json(result);
    };
}
exports.TransferController = TransferController;
//# sourceMappingURL=transfer.controller.js.map