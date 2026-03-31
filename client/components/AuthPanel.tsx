"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";

function AuthPanel() {
  const { user, loading, login, register, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }

      setPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Authentication failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await logout();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Logout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Auth</h2>
          <p className="text-sm text-zinc-400">
            {user ? `Signed in as ${user.email}` : "Login or register to create blogs."}
          </p>
        </div>
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 disabled:opacity-60"
          >
            Logout
          </button>
        )}
      </div>

      {!user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-lg px-3 py-2 text-sm ${
                mode === "login" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-300"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-lg px-3 py-2 text-sm ${
                mode === "register"
                  ? "bg-zinc-100 text-zinc-950"
                  : "bg-zinc-900 text-zinc-300"
              }`}
            >
              Register
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none"
            required
          />
          <button
            type="submit"
            disabled={submitting || loading}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}

export default AuthPanel;
