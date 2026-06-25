import { NextFunction, Request, Response } from "express";

import { FinanceService } from "./finance.service";

const financeService = new FinanceService();

export class FinanceController {
  async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const transactions = await financeService.getTransactions({
        search:
          typeof req.query.search === "string"
            ? req.query.search
            : undefined,
        type:
          typeof req.query.type === "string"
            ? req.query.type
            : undefined,
        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Finance transactions retrieved successfully",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const summary = await financeService.getSummary();

      res.status(200).json({
        success: true,
        message: "Finance summary retrieved successfully",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const transaction =
        await financeService.createTransaction(req.body);

      res.status(201).json({
        success: true,
        message: "Finance transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCashierSettlements(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const rows = await financeService.getCashierSettlements({
        status:
          typeof req.query.status === "string"
            ? req.query.status
            : undefined,
        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Cashier settlements retrieved successfully",
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosSales(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const rows = await financeService.getPosSales({
        status:
          typeof req.query.status === "string"
            ? req.query.status
            : undefined,
        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : undefined,
      });

      res.status(200).json({
        success: true,
        message: "POS sales retrieved successfully",
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const transaction =
        await financeService.updateTransaction(
          String(req.params.id),
          req.body,
        );

      res.status(200).json({
        success: true,
        message: "Finance transaction updated successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await financeService.deleteTransaction(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Finance transaction deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
