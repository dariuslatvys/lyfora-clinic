import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import { DoctorRail } from "@/components/doctor/sidebar";

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
    <div className="app">
      <DoctorRail
        labels={labels}
        doctorName={locale === "en" ? "Dr. Jane Smith" : "Dr. Rasa Rasaitė"}
        logoutLabel={labels.signOut}
        logoutAction={logout}
      />
      <div className="main">
        <header className="topbar">
          <div className="crumb">
            <b>{labels.brandDoctor}</b>
          </div>
          <div className="sp" />
          <LocaleSwitch locale={locale} />
        </header>
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
