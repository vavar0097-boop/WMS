import {
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/shared/lib/api/error";
import { toast } from "@/shared/ui/toast";
import {
  FinancePayload,
  FinanceSummary,
  FinanceTransaction,
  financeService,
} from "../services/finance.service";

type FinanceForm = {
  transaction_date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: string;
  payment_method: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: FinanceForm = {
  transaction_date: today,
  type: "INCOME",
  category: "",
  description: "",
  amount: "",
  payment_method: "",
};

function money(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function toPayload(form: FinanceForm): FinancePayload {
  return {
    transaction_date: form.transaction_date,
    type: form.type,
    category: form.category.trim(),
    description: form.description.trim() || null,
    amount: Number(form.amount),
    payment_method: form.payment_method.trim() || null,
  };
}

export function FinancePage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    income: 0,
    expense: 0,
    balance: 0,
    transaction_count: 0,
  });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] =
    useState<FinanceTransaction | null>(null);
  const [form, setForm] = useState<FinanceForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadFinance() {
      setIsLoading(true);

      try {
        const [rows, nextSummary] = await Promise.all([
          financeService.getTransactions({
            limit: 100,
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(type ? { type } : {}),
          }),
          financeService.getSummary(),
        ]);

        if (!mounted) return;

        setTransactions(rows);
        setSummary(nextSummary);
      } catch (error) {
        if (!mounted) return;

        toast.error(
          "Finance failed to load",
          getApiErrorMessage(error),
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    const timer = window.setTimeout(loadFinance, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search, type, reloadKey]);

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(row: FinanceTransaction) {
    setEditing(row);
    setForm({
      transaction_date: row.transaction_date,
      type: row.type,
      category: row.category,
      description: row.description || "",
      amount: String(row.amount),
      payment_method: row.payment_method || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.category.trim() || Number(form.amount) < 0) {
      toast.error(
        "Finance form incomplete",
        "Category and valid amount are required.",
      );
      return;
    }

    setIsSaving(true);

    try {
      if (editing) {
        await financeService.updateTransaction(
          editing.id,
          toPayload(form),
        );
        toast.success("Transaction updated", form.category);
      } else {
        await financeService.createTransaction(toPayload(form));
        toast.success("Transaction created", form.category);
      }

      closeModal();
      setReloadKey((value) => value + 1);
    } catch (error) {
      toast.error(
        editing
          ? "Transaction update failed"
          : "Transaction creation failed",
        getApiErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(row: FinanceTransaction) {
    if (!window.confirm(`Delete ${row.category} transaction?`)) return;

    try {
      await financeService.deleteTransaction(row.id);
      toast.success("Transaction deleted", row.category);
      setReloadKey((value) => value + 1);
    } catch (error) {
      toast.error(
        "Transaction delete failed",
        getApiErrorMessage(error),
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Finance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track income, expenses, and POS-ready finance movement.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Income", summary.income],
          ["Expense", summary.expense],
          ["Balance", summary.balance],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {money(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search category, note, payment"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Refresh finance"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Date", "Type", "Category", "Amount", "Payment", "Actions"].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 last:text-right"
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Loading finance...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No finance transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {row.transaction_date}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">
                      {row.type}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-950">
                        {row.category}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.description || "No description"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">
                      {money(row.amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {row.payment_method || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          aria-label="Edit transaction"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                {editing ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close finance form"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={form.transaction_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      transaction_date: event.target.value,
                    }))
                  }
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  required
                />
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as "INCOME" | "EXPENSE",
                    }))
                  }
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Category"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Amount"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  required
                />
                <input
                  value={form.payment_method}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      payment_method: event.target.value,
                    }))
                  }
                  placeholder="Payment method"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none md:col-span-2"
                />
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Description"
                  className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none md:col-span-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
