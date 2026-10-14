
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  TrendingUp,
  Wallet,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { getDashboard } from "../api/expenses";
import Navbar from "../components/Navbar";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const monthName = (year, month) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
  });

const inputClass =
  "rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500 [color-scheme:dark]";

export default function Reports() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const selectedReport = await getDashboard(year, month);
      setReport(selectedReport);

      const months = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(year, month - 1 - (5 - index), 1);
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
        };
      });

      const monthlyReports = await Promise.all(
        months.map(({ year: y, month: m }) => getDashboard(y, m))
      );

      setTrend(
        months.map((item, index) => ({
          ...item,
          label: monthName(item.year, item.month),
          total: Number(monthlyReports[index]?.monthly_total ?? 0),
        }))
      );
    } catch (err) {
      console.error("Reports loading failed:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const categories = useMemo(() => {
    return [...(report?.category_breakdown ?? [])]
      .map((item) => ({
        name: item.category || "Other",
        total: Number(item.total ?? 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [report]);

  const monthlyTotal = Number(report?.monthly_total ?? 0);
  const highestCategory = categories[0] ?? null;
  const daysInMonth = new Date(year, month, 0).getDate();
  const averageDaily = monthlyTotal / daysInMonth;
  const maxTrend = Math.max(1, ...trend.map((item) => item.total));
  const maxCategory = Math.max(1, ...categories.map((item) => item.total));

  const selectedMonthLabel = new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
  );

  const years = Array.from(
    { length: 6 },
    (_, index) => today.getFullYear() - 5 + index
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              FINANCIAL OVERVIEW
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Reports
            </h1>
            <p className="mt-2 text-slate-400">
              Understand your spending and monthly trends.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <CalendarDays
                size={17}
                className="shrink-0 text-emerald-400"
              />
              <select
                aria-label="Report month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-slate-900"
                    >
                      {new Date(2000, value - 1, 1).toLocaleDateString(
                        "en-IN",
                        { month: "long" }
                      )}
                    </option>
                  )
                )}
              </select>
            </label>

            <select
              aria-label="Report year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClass}
            >
              {years.map((value) => (
                <option key={value} value={value} className="bg-slate-900">
                  {value}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadReports}
              disabled={loading}
              title="Refresh reports"
              aria-label="Refresh reports"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-emerald-400 transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadReports}
              className="font-semibold text-emerald-400"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !report ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading reports...
          </div>
        ) : report ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">
                    Monthly spending
                  </p>
                  <Wallet className="shrink-0 text-emerald-400" size={20} />
                </div>
                <p className="mt-4 break-words text-2xl font-bold sm:text-3xl">
                  {currency(monthlyTotal)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedMonthLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Daily average</p>
                  <TrendingUp
                    className="shrink-0 text-emerald-400"
                    size={20}
                  />
                </div>
                <p className="mt-4 break-words text-2xl font-bold sm:text-3xl">
                  {currency(averageDaily)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Monthly spending divided by calendar days
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Top category</p>
                  <ReceiptText
                    className="shrink-0 text-emerald-400"
                    size={20}
                  />
                </div>
                <p className="mt-4 truncate text-2xl font-bold">
                  {highestCategory?.name ?? "No spending"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {highestCategory
                    ? currency(highestCategory.total)
                    : "No category data for this month"}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  Monthly spending trend
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Six months ending in {selectedMonthLabel}
                </p>
              </div>

              {trend.length === 0 ? (
                <p className="py-8 text-center text-slate-400">
                  No trend data available.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex h-64 min-w-[480px] items-end gap-3 border-b border-slate-800 pb-2 sm:gap-5">
                    {trend.map((item) => {
                      const height =
                        item.total === 0
                          ? 0
                          : Math.max(4, (item.total / maxTrend) * 100);

                      const isSelected =
                        item.year === year && item.month === month;

                      return (
                        <div
                          key={`${item.year}-${item.month}`}
                          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3"
                        >
                          <span className="max-w-full truncate text-xs text-slate-400">
                            {currency(item.total)}
                          </span>

                          <div className="flex h-full w-full items-end justify-center">
                            <div
                              title={`${item.label} ${item.year}: ${currency(item.total)}`}
                              className={`w-full max-w-16 rounded-t-lg transition-all ${
                                isSelected
                                  ? "bg-emerald-400"
                                  : "bg-emerald-800 hover:bg-emerald-600"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          </div>

                          <span
                            className={`text-center text-xs ${
                              isSelected
                                ? "font-semibold text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {item.label}
                            <span className="block">
                              {String(item.year).slice(-2)}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  Category breakdown
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Spending by category for {selectedMonthLabel}
                </p>
              </div>

              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">
                  <ReceiptText
                    className="mx-auto text-slate-500"
                    size={32}
                  />
                  <p className="mt-3 font-medium text-slate-300">
                    No category spending found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add expenses or choose another month.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map((item) => {
                    const percentage =
                      monthlyTotal > 0
                        ? (item.total / monthlyTotal) * 100
                        : 0;

                    return (
                      <div key={item.name}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-slate-200">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-400">
                              {percentage.toFixed(1)}%
                            </span>
                            <span className="font-semibold text-white">
                              {currency(item.total)}
                            </span>
                          </div>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-400 transition-all"
                            style={{
                              width: `${Math.min(100, (item.total / maxCategory) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          !error && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              No report data available.
            </div>
          )
        )}
      </main>
    </div>
  );
}
