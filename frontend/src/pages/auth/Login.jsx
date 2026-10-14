import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await login(email, password);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response?.status === 401) {
        alert("Invalid email or password.");
      } else if (error.response?.status === 403) {
        alert("Your account is inactive.");
      } else if (error.response?.status === 422) {
        alert("Please enter valid login details.");
      } else {
        alert("Could not connect to the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-400">
            SpendWise
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your expenses smarter
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome Back
          </h2>

          <p className="text-slate-400 mb-6">
            Sign in to your SpendWise account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:cursor-not-allowed text-slate-950 font-semibold transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Secure login powered by SpendWise
          </p>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;