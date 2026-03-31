"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";

type AuthPageFormProps = {
  mode: "signin" | "signup";
};

function AuthPageForm({ mode }: AuthPageFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignin = mode === "signin";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isSignin) {
        await login(email, password);
      } else {
        await register(email, password);
      }

      router.push("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Authentication failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">
          {isSignin ? "Sign in" : "Sign up"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {isSignin
            ? "Use your account to access protected blog actions."
            : "Create an account and start using protected blog actions."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : isSignin
                ? "Sign in"
                : "Sign up"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <p className="mt-6 text-sm text-zinc-400">
          {isSignin ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            href={isSignin ? "/signup" : "/signin"}
            className="text-zinc-100 underline"
          >
            {isSignin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default AuthPageForm;
