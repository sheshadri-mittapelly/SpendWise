
import { useState } from "react";
import { createExpense } from "../../api/expenses";

const initialForm = {
  title: "",
  amount: "",
  category: "Food",
  expense_date: new Date().toISOString().slice(0, 16),
  description: "",
};

function AddExpenseModel({ isOpen, onClose, onExpenseAdded }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      setError("Enter a title and a valid amount greater than zero.");
      return;
    }

    try {
      setLoading(true);

      await createExpense({
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        expense_date: new Date(form.expense_date).toISOString(),
        description: form.description.trim() || null,
      });

      setForm(initialForm);
      onClose();

      if (onExpenseAdded) {
        await onExpenseAdded();
      }
    } catch (err) {
      console.error("Failed to create expense:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 422) {
        setError("Please check the expense details and try again.");
      } else {
        setError("Could not save the expense. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Add Expense
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-slate-400 hover:text-white"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Expense Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Lunch"
              maxLength={100}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Amount (₹)
            </label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Entertainment</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Date and Time
            </label>
            <input
              name="expense_date"
              type="datetime-local"
              value={form.expense_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add a note..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModel;
