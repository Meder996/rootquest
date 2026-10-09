"use client";

import { Suspense,  useEffect, useState  } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "missing">(
    token ? "verifying" : "missing"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          setStatus("success");
          setMessage(body.message || "Your email has been verified.");
        } else {
          setStatus("error");
          setMessage(body.error || "This verification link is invalid or expired.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not verify your email. Please try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-violet" aria-hidden="true" />
            <h1 className="font-display text-2xl font-bold">Verifying your email…</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-bold">Email verified</h1>
            <p className="max-w-sm text-sm text-muted">{message}</p>
            <Link href="/dashboard">
              <Button className="mt-2">Go to your dashboard</Button>
            </Link>
          </>
        )}
        {(status === "error" || status === "missing") && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/15 text-coral">
              <XCircle className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-bold">Verification failed</h1>
            <p className="max-w-sm text-sm text-muted">
              {message ||
                "This verification link is missing its token. Request a new one from your profile."}
            </p>
            <div className="mt-2 flex gap-2">
              <Link href="/auth/log-in">
                <Button variant="secondary">Log in</Button>
              </Link>
              <Link href="/profile">
                <Button>Resend verification</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
