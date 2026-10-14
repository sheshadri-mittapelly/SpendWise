
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Wallet,
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api/v1";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.full_name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/auth/register`, {
        full_name: name,
        email,
        password: form.password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { registered: true, email },
        });
      }, 800);
    } catch (err) {
      console.error("Registration failed:", err);

      const detail = err.response?.data?.detail;

      if (err.response?.status === 409) {
        setError("An account with this email may already exist.");
      } else if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else {
        setError(
          "Unable to create your account. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link
          to="/login"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
            <Wallet size={27} className="text-slate-950" />
          </div>

          <span className="text-3xl font-bold tracking-tight">
            Spend<span className="text-emerald-400">Wise</span>
          </span>
        </Link>

        {/* Register card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Start managing your expenses with SpendWise.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                  disabled={loading}
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 border-t border-slate-800" />

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-slate-600">
          SpendWise · Manage your money smarter
        </p>
      </div>
    </main>
  );
}
