import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function DoctorLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-10 md:grid-cols-2 md:items-center">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/brand/lyfora-logo.png"
              alt="Lyfora"
              width={140}
              height={46}
              className="h-9 w-auto"
            />
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Specialistams
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight md:text-5xl">
            Gydytojo darbo vieta
          </h1>
          <p className="mt-4 max-w-md text-[var(--ink-soft)]">
            Klinikos darbuotojo aplinka — pacientų apžvalga ir tolesni žingsniai.
          </p>
        </div>
        <LoginForm
          role="doctor"
          title="Prisijungimas"
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
