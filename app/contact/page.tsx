"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject: subject || null, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setStatus("sent");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/10 text-violet">
          <Mail className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-4xl font-extrabold">Contact us</h1>
        <p className="mt-3 text-muted">
          Questions, feedback, or a word part you wish we had? Send us a note —
          we read everything.
        </p>
      </div>

      <Card className="mt-10">
        {status === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-success">
              <Send className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-bold">Message sent</h2>
            <p className="max-w-md text-sm text-muted">
              Thanks for reaching out — we will get back to you as soon as we can.
            </p>
            <Button variant="secondary" onClick={() => setStatus("idle")}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input
              label="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Suggestion for a new root"
              maxLength={120}
            />
            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what is on your mind…"
              rows={6}
              required
              minLength={5}
            />
            {status === "error" && (
              <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={status === "sending"} className="gap-2 self-start">
              <Send className="h-4 w-4" aria-hidden="true" />
              Send message
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
