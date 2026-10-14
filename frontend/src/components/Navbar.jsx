
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", Icon: ReceiptText },
  { to: "/reports", label: "Reports", Icon: ChartNoAxesCombined },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
      isActive
        ? "bg-emerald-500/10 text-emerald-400"
        : "text-slate-400 hover:bg-slate-900 hover:text-white"
    }`;

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          onClick={closeMenu}
          className="shrink-0 text-2xl font-bold tracking-tight"
        >
          Spend<span className="text-emerald-400">Wise</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Logout
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-900 lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="border-t border-slate-800 bg-slate-950 px-4 py-3 lg:hidden sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={linkClass}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
