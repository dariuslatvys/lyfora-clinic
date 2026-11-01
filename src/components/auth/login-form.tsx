"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Nepavyko prisijungti / Sign-in failed");
      return;
    }
    const data = await res.json();
    router.push(data.redirect);
    router.refresh();
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
          required
        />
      </label>
      {error && <p className="text-sm text-[var(--colour-red,#C23B2E)]">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {labels.signIn}
      </Button>
    </form>
  );
}
