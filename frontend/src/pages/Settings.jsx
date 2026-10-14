
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LockKeyhole,
  Save,
  LoaderCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import Navbar from "../components/Navbar";
import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from "../api/auth";

const PREFS_KEY = "sw_preferences";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 [color-scheme:dark]";

const cardClass =
  "space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7";

export default function Settings() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [currency, setCurrency] = useState("INR");
  const [notifications, setNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(PREFS_KEY) || "{}"
      );
      setCurrency(saved.currency || "INR");
      setNotifications(saved.notifications ?? true);
    } catch {
      // Use default preferences.
    }

    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const user = await getCurrentUser();
      setProfile({
        name: user.name || "",
        email: user.email || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your profile. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = profile.name.trim();
    const email = profile.email.trim();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    setSaving(true);

    try {
      const user = await updateCurrentUser({ name, email });
      setProfile({
        name: user.name || name,
        email: user.email || email,
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ currency, notifications })
      );
      setError("");
      setMessage("Preferences saved on this device.");
    } catch {
      setError("Unable to save preferences.");
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword({ new_password: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setPasswordError(
        err.response?.data?.detail ||
          "Unable to change password. Check your backend endpoint."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  const initial = profile.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-400">
            YOUR ACCOUNT
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile & Settings
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your account and preferences.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300"
          >
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-6">
            <LoaderCircle
              className="animate-spin text-emerald-400"
              size={20}
            />
            Loading profile...
          </div>
        ) : (
          <>
            <form onSubmit={saveProfile} className={cardClass}>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/10 text-3xl font-bold text-emerald-400">
                  {initial}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {profile.name || "Your profile"}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Full name
                </label>
                <input
                  id="profile-name"
                  className={inputClass}
                  value={profile.name}
                  onChange={(event) =>
                    setProfile({ ...profile, name: event.target.value })
                  }
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className={inputClass}
                  value={profile.email}
                  onChange={(event) =>
                    setProfile({ ...profile, email: event.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>

            <section className={cardClass}>
              <h2 className="text-lg font-semibold">Preferences</h2>

              <div>
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Default currency
                </label>
                <select
                  id="currency"
                  className={inputClass}
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                >
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                </select>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-slate-800 p-4">
                Notifications enabled
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) =>
                    setNotifications(event.target.checked)
                  }
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>

              <button
                type="button"
                onClick={savePreferences}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 px-5 py-3 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Save size={18} />
                Save preferences
              </button>
            </section>

            <form onSubmit={savePassword} className={cardClass}>
              <div className="flex items-center gap-3">
                <LockKeyhole size={22} className="text-emerald-400" />
                <h2 className="text-lg font-semibold">Change Password</h2>
                <ShieldCheck
                  size={20}
                  className="ml-auto text-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm text-slate-300"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  className={inputClass}
                  placeholder="Enter new password (minimum 8 characters)"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  className={inputClass}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                />
              </div>

              {passwordError && (
                <p role="alert" className="text-sm text-red-300">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p role="status" className="text-sm text-emerald-300">
                  {passwordMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {changingPassword && (
                  <LoaderCircle size={18} className="animate-spin" />
                )}
                {changingPassword ? "Changing..." : "Change password"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
