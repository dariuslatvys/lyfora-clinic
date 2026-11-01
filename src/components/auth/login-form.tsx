"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm({
  role,
  title,
  demoHint,
  labels,
}: {
  role: "patient" | "doctor";
  title: string;
  demoHint: string;
  labels: {
    email: string;
    password: string;
    signIn: string;
  };
}) {
  const [email, setEmail] = useState(
    role === "patient" ? "pacientas@lyfora.lt" : "gydytojas@lyfora.lt"
  );
  const [password, setPassword] = useState("lyfora2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        setError("Nepavyko prisijungti / Sign-in failed");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { redirect?: string };
      // Full navigation so the session cookie is reliably picked up
      window.location.href = data.redirect || "/patient/digital-twin";
    } catch {
      setError("Nepavyko prisijungti / Sign-in failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel mx-auto w-full max-w-md space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">{title}</h1>
      <p className="text-sm text-[var(--muted)]">{demoHint}</p>
      <label className="block text-sm">
        <span className="mb-1 block text-[var(--muted)]">{labels.email}</span>
        <input
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          name="email"
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-[var(--muted)]">{labels.password}</span>
        <input
          className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="text-sm text-[#C23B2E]">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "…" : labels.signIn}
      </Button>
    </form>
  );
}
