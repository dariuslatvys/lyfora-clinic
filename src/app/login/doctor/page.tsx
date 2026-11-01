import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function DoctorLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-10 md:grid-cols-2 md:items-center">
        <div>
          <Link href="/" className="text-sm text-[var(--muted)]">
            ← Lyfora
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight">
            Lyfora | Gydytojo aplinka
          </h1>
          <p className="mt-4 max-w-md text-[var(--ink-soft)]">
            Klinikos darbuotojo darbo vieta — pacientų apžvalga ir tolesni
            žingsniai.
          </p>
        </div>
        <LoginForm
          role="doctor"
          title="Gydytojo darbo vieta"
          demoHint="Demo: gydytojas@lyfora.lt / lyfora2026"
          labels={{
            email: "El. paštas / Email",
            password: "Slaptažodis / Password",
            signIn: "Prisijungti",
          }}
        />
      </div>
    </main>
  );
}
