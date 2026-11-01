import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import { Button } from "@/components/ui/button";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") {
    redirect("/login/doctor");
  }
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  async function logout() {
    "use server";
    await destroySession();
    redirect("/");
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            {labels.brandShort}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            {labels.brandDoctor}
          </h1>
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
  );
}
