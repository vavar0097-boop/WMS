import { BadRequestError } from "../../utils/errors";
import {
  FinanceRepository,
  FinanceTransactionPayload,
} from "./finance.repository";

const financeRepository = new FinanceRepository();

function cleanPayload(
  payload: FinanceTransactionPayload,
): FinanceTransactionPayload {
  const type = payload.type;
  const category = payload.category?.trim();
  const amount = Number(payload.amount);

  if (!["INCOME", "EXPENSE"].includes(type)) {
    throw new BadRequestError("Invalid finance transaction type");
  }

  if (!category || !Number.isFinite(amount) || amount < 0) {
    throw new BadRequestError(
      "Category and valid amount are required",
    );
  }

  return {
    transaction_date:
      payload.transaction_date || new Date().toISOString().slice(0, 10),
    type,
    category,
    description: payload.description?.trim() || null,
    amount,
    payment_method: payload.payment_method?.trim() || null,
  };
}

export class FinanceService {
  async getTransactions(params?: {
    search?: string;
    type?: string;
    limit?: number;
  }) {
    return financeRepository.findAll(params);
  }

  async getSummary() {
    const rows = await financeRepository.findAll({
      limit: 1000,
    });

    const income = rows
      .filter((row) => row.type === "INCOME")
      .reduce((sum, row) => sum + Number(row.amount), 0);
    const expense = rows
      .filter((row) => row.type === "EXPENSE")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
      transaction_count: rows.length,
    };
  }

  async createTransaction(payload: FinanceTransactionPayload) {
    return financeRepository.create(cleanPayload(payload));
  }

  async updateTransaction(
    id: string,
    payload: Partial<FinanceTransactionPayload>,
  ) {
    return financeRepository.update(id, cleanPayload(payload as FinanceTransactionPayload));
  }

  async deleteTransaction(id: string) {
    await financeRepository.delete(id);
  }
}
