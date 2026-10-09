"use client";

import { Suspense,  useState  } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LogInPage() {
  return (
    <Suspense fallback={null}>
      <LogInPageContent />
    </Suspense>
  );
}

function LogInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not log you in.");
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log you in.");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-turquoise to-violet text-white shadow-glow-turquoise">
          <LogIn className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Log in to continue growing your word garden.
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
          />
          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {error}
            </p>
          )}
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Log in
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-turquoise hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        New to RootQuest?{" "}
        <Link href="/auth/sign-up" className="font-semibold text-violet hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
