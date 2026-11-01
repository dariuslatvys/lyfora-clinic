import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function PatientLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-10 md:grid-cols-2 md:items-center">
        <div>
          <Link href="/" className="text-sm text-[var(--muted)]">
            ← Lyfora
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight">
            Lyfora | Tavo personalinė klinika
          </h1>
          <p className="mt-4 max-w-md text-[var(--ink-soft)]">
            Paciento aplinka „Mano sveikata“ — skaitmeninis dvynys, tyrimai ir
            sveikatos kortelė.
          </p>
        </div>
        <LoginForm
          role="patient"
          title="Mano sveikata"
          demoHint="Demo: pacientas@lyfora.lt / lyfora2026 (tikri tyrimai) · paciente@lyfora.lt (demo genetika + NGS)"
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
