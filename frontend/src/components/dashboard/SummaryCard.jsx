import { ArrowDownRight } from "lucide-react";

function SummaryCard({ title, value, change, icon: Icon, positive = false }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className="rounded-lg bg-slate-800 p-2 text-emerald-400">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>

      <p
        className={`mt-2 flex items-center gap-1 text-xs ${
          positive ? "text-emerald-400" : "text-slate-400"
        }`}
      >
        {positive && <ArrowDownRight size={14} />}
        {change}
      </p>
    </div>
  );
}

export default SummaryCard;