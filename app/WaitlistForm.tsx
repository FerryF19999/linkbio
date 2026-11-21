"use client";

import { FormEvent, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import styles from "./landing.module.css";

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
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { alreadyJoined?: boolean };

      form.reset();
      setState({
        type: "success",
        message: result.alreadyJoined
          ? "Email ini sudah terdaftar untuk akses awal."
          : "Kamu sudah terdaftar. Tunggu kabar dari NEMU di emailmu.",
      });
    } catch {
      setState({
        type: "error",
        message: "Pendaftaran belum terkirim. Coba lagi sebentar ya.",
      });
    }
  }

  return (
    <div className={styles.waitlist}>
      <form onSubmit={submitWaitlist} aria-busy={state.type === "loading"}>
        <label>
          <span>Nama</span>
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Nama kamu" />
        </label>
        <label>
          <span>Email</span>
          <input name="email" required type="email" maxLength={254} autoComplete="email" placeholder="nama@email.com" />
        </label>
        <button type="submit" className={styles.lightAction} disabled={state.type === "loading"}>
          {state.type === "loading" ? "Mengirim…" : "Daftarkan saya"} <FiArrowRight aria-hidden="true" />
        </button>
      </form>
      <p className={styles.message} data-state={state.type} role="status">{state.message}</p>
    </div>
  );
}
