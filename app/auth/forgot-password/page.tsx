"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setDevToken(body.devResetToken ?? "");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/15 text-coral">
          <KeyRound className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we will send you a reset link.
        </p>
      </div>

      <Card>
        {status === "sent" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-turquoise/40 bg-turquoise/10 px-4 py-3 text-sm text-turquoise">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                If an account exists for <strong>{email}</strong>, a reset link is on
                its way. Check your inbox (and spam folder).
              </span>
            </div>
            {devToken && (
              <div className="rounded-xl border border-yellow/40 bg-yellow/10 px-4 py-3 text-xs text-yellow">
                <p className="mb-1 font-semibold">Development mode</p>
                <p className="mb-2">
                  Email delivery is not configured in this environment, so here is
                  your reset link:
                </p>
                <Link
                  href={`/auth/reset-password?token=${devToken}`}
                  className="break-all font-mono underline"
                >
                  Open reset link
                </Link>
              </div>
            )}
            <Link href="/auth/log-in">
              <Button variant="secondary" className="w-full">
                Back to log in
              </Button>
            </Link>
          </div>
        ) : (
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
            {status === "error" && (
              <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={status === "sending"} className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/auth/log-in" className="font-semibold text-turquoise hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
