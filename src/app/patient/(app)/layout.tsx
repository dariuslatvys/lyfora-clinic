import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { PatientSidebar } from "@/components/patient/sidebar";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import { Button } from "@/components/ui/button";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "patient" || !current.patient) {
    redirect("/login/patient");
  }
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  async function logout() {
    "use server";
    await destroySession();
    redirect("/");
  }

  return (
    <div className="shell">
      <div className="min-w-0">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              {labels.brandShort}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl">
              {labels.brandPatient}
            </h1>
            <p className="text-sm text-[var(--ink-soft)]">
              {current.patient.fullName} ·{" "}
              {current.patient.sex === "male" ? labels.sexMale : labels.sexFemale}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitch locale={locale} />
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                {labels.signOut}
              </Button>
            </form>
          </div>
        </header>
        {children}
      </div>
      <PatientSidebar labels={labels} />
    </div>
  );
}
