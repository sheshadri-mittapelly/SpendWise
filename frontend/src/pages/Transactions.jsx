
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  ReceiptText,
} from "lucide-react";
import {
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../api/expenses";

const PAGE_SIZE = 8;

const categories = [
  "All Categories",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Other",
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getExpenses({ skip: 0, limit: 1000 });
      setExpenses(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filteredExpenses = useMemo(() => {
    const result = expenses.filter((expense) => {
      const matchesSearch = [
        expense.title,
        expense.description,
        expense.category,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        );

      const matchesCategory =
        category === "All Categories" || expense.category === category;

      const rawDate = expense.expense_date ?? expense.date;
      const date = rawDate ? String(rawDate).slice(0, 10) : "";

      const matchesStart = !startDate || (date && date >= startDate);
      const matchesEnd = !endDate || (date && date <= endDate);

      return matchesSearch && matchesCategory && matchesStart && matchesEnd;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.expense_date ?? a.date ?? 0).getTime();
      const dateB = new Date(b.expense_date ?? b.date ?? 0).getTime();

      if (sortOrder === "oldest") return dateA - dateB;
      if (sortOrder === "amount-high") {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortOrder === "amount-low") {
        return Number(a.amount) - Number(b.amount);
      }
      return dateB - dateA;
    });

    return result;
  }, [expenses, search, category, startDate, endDate, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [search, category, startDate, endDate, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);

  const pageExpenses = filteredExpenses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError("");

    try {
      const rawDate = editing.expense_date ?? editing.date;

      await updateExpense(editing.id, {
        title: editing.title,
        amount: Number(editing.amount),
        category: editing.category,
        expense_date: editing.expense_date
          ? new Date(editing.expense_date).toISOString()
          : rawDate
            ? new Date(rawDate).toISOString()
            : undefined,
        description: editing.description || null,
      });

      setEditing(null);
      await loadExpenses();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update this transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setError("");

    try {
      await deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not delete this transaction."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-2 text-sm text-slate-400">
            Search, filter, and manage all your expenses.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Matching transactions</p>
            <p className="mt-2 text-2xl font-bold">
              {filteredExpenses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Filtered total</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {currency(totalAmount)}
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category, or description..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
              className={inputClass}
            />

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
              className={inputClass}
            />

            <button
              type="button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "newest" ? "oldest" : "newest"
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-3 hover:bg-slate-800"
            >
              <ArrowUpDown size={16} />
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Showing {pageExpenses.length} of {filteredExpenses.length}{" "}
              transactions
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All Categories");
                setStartDate("");
                setEndDate("");
                setSortOrder("newest");
              }}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Clear filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <p className="p-8 text-center text-slate-400">
              Loading transactions...
            </p>
          ) : pageExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <ReceiptText className="mx-auto text-slate-500" size={40} />
              <p className="mt-3 font-semibold text-slate-200">
                No transactions found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Transaction</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {pageExpenses.map((expense) => {
                    const rawDate = expense.expense_date ?? expense.date;

                    return (
                      <tr
                        key={expense.id}
                        className="transition hover:bg-slate-800/50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">{expense.title}</p>
                          {expense.description && (
                            <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                              {expense.description}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-300">
                            {expense.category}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {rawDate
                            ? new Date(rawDate).toLocaleDateString("en-IN")
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold">
                          {currency(expense.amount)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditing({
                                  ...expense,
                                  expense_date: rawDate
                                    ? new Date(rawDate)
                                        .toISOString()
                                        .slice(0, 16)
                                    : "",
                                })
                              }
                              title="Edit transaction"
                              aria-label="Edit transaction"
                              className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-950"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeExpense(expense.id)}
                              title="Delete transaction"
                              aria-label="Delete transaction"
                              className="rounded-lg p-2 text-red-400 hover:bg-red-950"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredExpenses.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
            <form
              onSubmit={saveEdit}
              className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold">Edit transaction</h2>

              <label className="block text-sm font-medium">
                Title
                <input
                  required
                  value={editing.title || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className={`${inputClass} mt-1`}
                />
              </label>

              <label className="block text-sm font-medium">
                Amount (₹)
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={editing.amount ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, amount: e.target.value })
                  }
                  className={`${inputClass} mt-1`}
                />
              </label>

              <label className="block text-sm font-medium">
                Category
                <select
                  required
                  value={editing.category || "Other"}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  className={`${inputClass} mt-1`}
                >
                  {categories
                    .filter((item) => item !== "All Categories")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Date
                <input
                  required
                  type="datetime-local"
                  value={editing.expense_date || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      expense_date: e.target.value,
                    })
                  }
                  className={`${inputClass} mt-1`}
                />
              </label>

              <label className="block text-sm font-medium">
                Description
                <textarea
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className={`${inputClass} mt-1`}
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
