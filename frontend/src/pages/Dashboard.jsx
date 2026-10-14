import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Wallet,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import Navbar from "../components/Navbar";
import AddExpenseModel from "../components/dashboard/AddExpenseModel.jsx";
import {
  getDashboard,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../api/expenses";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Other",
];

function formatCurrency(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const messageTimerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    expense_date: "",
    description: "",
  });

  const showTemporaryMessage = (message) => {
    setActionError("");
    setActionSuccess(message);

    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = setTimeout(() => {
      setActionSuccess("");
      messageTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setPageError("");

    try {
      const now = new Date();
      const [dashboardData, expenseData] = await Promise.all([
        getDashboard(now.getFullYear(), now.getMonth() + 1),
        getExpenses({ skip: 0, limit: 5 }),
      ]);

      setDashboard(dashboardData);
      const list = Array.isArray(expenseData)
        ? expenseData
        : Array.isArray(expenseData?.items)
          ? expenseData.items
          : Array.isArray(expenseData?.expenses)
            ? expenseData.expenses
            : [];
      setExpenses(list.slice(0, 5));
    } catch (error) {
      console.error("Dashboard loading failed:", error);
      setPageError(
        error.response?.status === 401
          ? "Your session has expired. Please sign in again."
          : error.response?.data?.detail ||
              "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const startEdit = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      title: expense.title ?? "",
      amount: String(expense.amount ?? ""),
      category: expense.category ?? "Food",
      expense_date: toDateTimeLocal(expense.expense_date),
      description: expense.description ?? "",
    });
    setActionError("");
    setActionSuccess("");
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditingExpense(null);
    setActionError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");

    if (!editingExpense) return;

    if (
      !editForm.title.trim() ||
      !editForm.amount ||
      !Number.isFinite(Number(editForm.amount)) ||
      Number(editForm.amount) <= 0 ||
      !editForm.expense_date
    ) {
      setActionError("Enter an expense title, a valid amount, and a date.");
      return;
    }

    setSavingEdit(true);
    try {
      await updateExpense(editingExpense.id, {
        title: editForm.title.trim(),
        amount: Number(editForm.amount),
        category: editForm.category,
        expense_date: new Date(editForm.expense_date).toISOString(),
        description: editForm.description.trim() || null,
      });
      setEditingExpense(null);
      showTemporaryMessage("Transaction updated successfully.");
      await loadDashboard(true);
    } catch (error) {
      console.error("Update expense failed:", error);
      setActionError(
        error.response?.data?.detail || "Could not update the expense."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete without a browser confirmation popup.
  // Update the UI immediately, and restore the row if the API request fails.
  const removeExpense = async (expenseId) => {
    if (deletingId !== null) return;

    const expenseToRestore = expenses.find(
      (expense) => expense.id === expenseId
    );

    setActionError("");
    setActionSuccess("");
    setDeletingId(expenseId);

    // Optimistic update: remove the transaction immediately.
    setExpenses((current) =>
      current.filter((expense) => expense.id !== expenseId)
    );

    try {
      await deleteExpense(expenseId);
      showTemporaryMessage("Transaction deleted successfully.");

      // Refresh totals and the recent transaction list from the backend.
      await loadDashboard(true);
    } catch (error) {
      console.error("Delete expense failed:", {
        status: error.response?.status,
        detail: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });

      // Restore the transaction if the server did not confirm deletion.
      if (expenseToRestore) {
        setExpenses((current) => {
          if (current.some((expense) => expense.id === expenseId)) {
            return current;
          }
          return [...current, expenseToRestore]
            .sort(
              (a, b) =>
                new Date(b.expense_date).getTime() -
                new Date(a.expense_date).getTime()
            )
            .slice(0, 5);
        });
      }

      setActionError(
        error.response?.data?.detail ||
          "Could not delete the expense. The server request failed."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Welcome back! Here is an overview of your expenses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActionError("");
              setActionSuccess("");
              setIsModalOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
          >
            <Plus size={19} />
            Add Expense
          </button>
        </section>

        {pageError && !loading && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400"
          >
            {pageError}
            <button
              type="button"
              onClick={() => loadDashboard()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <RefreshCw className="mr-3 animate-spin text-emerald-400" />
            <span className="text-slate-400">Loading dashboard...</span>
          </div>
        ) : !pageError ? (
          <>
            {actionError && !editingExpense && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400"
              >
                {actionSuccess}
              </div>
            )}

            <section
              aria-label="Expense summary"
              className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Total Expenses</p>
                  <div className="rounded-xl bg-slate-800 p-3">
                    <Wallet size={21} className="text-emerald-400" />
                  </div>
                </div>
                <h2 className="mt-4 break-words text-2xl font-bold sm:text-3xl">
                  {formatCurrency(dashboard?.total_expenses)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  All recorded expenses
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-slate-900 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">This Month</p>
                  <div className="rounded-xl bg-emerald-500/10 p-3">
                    <TrendingUp size={21} className="text-emerald-400" />
                  </div>
                </div>
                <h2 className="mt-4 break-words text-2xl font-bold text-emerald-400 sm:text-3xl">
                  {formatCurrency(dashboard?.monthly_total)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Spending in the current month
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Recent Transactions</p>
                  <div className="rounded-xl bg-slate-800 p-3">
                    <ReceiptText size={21} className="text-emerald-400" />
                  </div>
                </div>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                  {expenses.length}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Latest transactions shown below
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold sm:text-xl">
                    Recent Transactions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and manage your latest expenses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadDashboard(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-50 sm:self-auto"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {expenses.length === 0 ? (
                <div className="px-5 py-14 text-center sm:px-6">
                  <ReceiptText
                    size={28}
                    className="mx-auto text-emerald-400"
                  />
                  <h3 className="mt-4 font-semibold">No expenses yet</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Add your first expense to start tracking your spending.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="mt-5 rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Add Your First Expense
                  </button>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-800 bg-slate-900/70">
                        <tr className="text-xs uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-4 font-medium">Expense</th>
                          <th className="px-6 py-4 font-medium">Category</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 text-right font-medium">Amount</th>
                          <th className="px-6 py-4 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="transition hover:bg-slate-800/30"
                          >
                            <td className="max-w-xs px-6 py-4">
                              <p className="truncate font-medium">{expense.title}</p>
                              {expense.description && (
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {expense.description}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                {expense.category || "Other"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                              {formatDate(expense.expense_date)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right font-semibold">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(expense)}
                                  aria-label={`Edit ${expense.title}`}
                                  title="Edit expense"
                                  className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10"
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExpense(expense.id)}
                                  disabled={deletingId !== null}
                                  aria-label={`Delete ${expense.title}`}
                                  title="Delete expense"
                                  className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  {deletingId === expense.id ? (
                                    <RefreshCw size={17} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={17} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-800 md:hidden">
                    {expenses.map((expense) => (
                      <article key={expense.id} className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words font-medium">
                              {expense.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {expense.category || "Other"} ·{" "}
                              {formatDate(expense.expense_date)}
                            </p>
                            {expense.description && (
                              <p className="mt-2 break-words text-sm text-slate-500">
                                {expense.description}
                              </p>
                            )}
                          </div>
                          <p className="shrink-0 text-right font-semibold">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(expense)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Pencil size={15} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExpense(expense.id)}
                            disabled={deletingId !== null}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === expense.id ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        ) : null}
      </main>

      <AddExpenseModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={async () => {
          setIsModalOpen(false);
          setActionError("");
          showTemporaryMessage("Expense added successfully.");
          await loadDashboard(true);
        }}
      />

      {editingExpense && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-expense-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6"
          >
            <h2 id="edit-expense-title" className="text-xl font-semibold">
              Edit Expense
            </h2>
            <p className="mb-6 mt-1 text-sm text-slate-400">
              Update your transaction details.
            </p>

            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Expense title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm({ ...editForm, title: event.target.value })
                  }
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="edit-amount" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Amount (₹)
                </label>
                <input
                  id="edit-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(event) =>
                    setEditForm({ ...editForm, amount: event.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="edit-category" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Category
                </label>
                <select
                  id="edit-category"
                  value={editForm.category}
                  onChange={(event) =>
                    setEditForm({ ...editForm, category: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-date" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Date and time
                </label>
                <input
                  id="edit-date"
                  type="datetime-local"
                  value={editForm.expense_date}
                  onChange={(event) =>
                    setEditForm({ ...editForm, expense_date: event.target.value })
                  }
                  required
                  className="w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Description (optional)
                </label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({ ...editForm, description: event.target.value })
                  }
                  rows={3}
                  maxLength={500}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              {actionError && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  {actionError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 sm:py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
                >
                  {savingEdit && <RefreshCw size={16} className="animate-spin" />}
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
