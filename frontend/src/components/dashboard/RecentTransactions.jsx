import {
  Utensils,
  Car,
  ShoppingBag,
  House,
} from "lucide-react";

const transactions = [
  {
    id: 1,
    title: "Lunch",
    category: "Food",
    date: "Oct 01, 2026",
    amount: 250.5,
    icon: Utensils,
  },
  {
    id: 2,
    title: "Uber ride",
    category: "Transport",
    date: "Sep 30, 2026",
    amount: 180,
    icon: Car,
  },
  {
    id: 3,
    title: "Shopping",
    category: "Shopping",
    date: "Sep 29, 2026",
    amount: 1200,
    icon: ShoppingBag,
  },
  {
    id: 4,
    title: "Electricity bill",
    category: "Bills",
    date: "Sep 28, 2026",
    amount: 950,
    icon: House,
  },
];

function RecentTransactions() {
  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Recent transactions</h3>
          <p className="mt-1 text-sm text-slate-400">
            Your latest expenses
          </p>
        </div>

        <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Transaction</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => {
              const Icon = transaction.icon;

              return (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-800/70 last:border-0"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-800 p-2 text-emerald-400">
                        <Icon size={18} />
                      </div>
                      <span className="font-medium">
                        {transaction.title}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-slate-400">
                    {transaction.category}
                  </td>

                  <td className="py-4 text-slate-400">
                    {transaction.date}
                  </td>

                  <td className="py-4 text-right font-medium">
                    -₹{transaction.amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentTransactions;