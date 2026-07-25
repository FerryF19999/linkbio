"use client";

import { FormEvent, useState } from "react";

type FormState =
  | { type: "idle"; message: "" }
  | { type: "loading"; message: "" }
  | { type: "success" | "error"; message: string };

export default function WaitlistForm() {
  const [state, setState] = useState<FormState>({ type: "idle", message: "" });

  async function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setState({ type: "loading", message: "" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        alreadyJoined?: boolean;
      };
      if (!response.ok) throw new Error(result.error || "Unable to join.");

      form.reset();
      setState({
        type: "success",
        message: result.alreadyJoined
          ? "You are already on the waitlist — we saved your spot."
          : "You are in! We will email you when NEMU opens.",
      });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
    }
  }

  return (
    <div className="landing-waitlist" id="waitlist">
      <form onSubmit={submitWaitlist}>
        <label>
          <span>Your name</span>
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Nemu Creator" />
        </label>
        <label>
          <span>Email address</span>
          <input name="email" required type="email" maxLength={254} autoComplete="email" placeholder="you@email.com" />
        </label>
        <button type="submit" disabled={state.type === "loading"}>
          {state.type === "loading" ? "Joining..." : "Join the waitlist"} <span aria-hidden="true">→</span>
        </button>
      </form>
      <div className="landing-waitlist-meta">
        <span>✦ Early access</span>
        <span>No spam. Unsubscribe anytime.</span>
      </div>
      {state.message && (
        <p className={`waitlist-message ${state.type}`} role="status">
          {state.message}
        </p>
      )}
    </div>
  );
}
