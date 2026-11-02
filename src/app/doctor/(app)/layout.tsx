import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import { DoctorRail } from "@/components/doctor/sidebar";
import { GlobalSearch } from "@/components/patient/global-search";
import { DoctorTopbarActions } from "@/components/doctor/doctor-topbar-actions";

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
        locale={locale}
      />
      <div className="main">
        <header className="topbar">
          <div className="crumb">
            <b>{labels.doctorPortal}</b>
          </div>
          <div className="sp" />
          <GlobalSearch
            locale={locale}
            placeholder={
              locale === "en"
                ? "Search patients, visits, requests, labs…"
                : "Ieškoti pacientų, vizitų, užklausų, tyrimų…"
            }
            emptyLabel={labels.globalSearchEmpty}
            searchingLabel={labels.globalSearchSearching}
            apiPath="/api/doctor/search"
          />
          <LocaleSwitch locale={locale} />
          <DoctorTopbarActions locale={locale} />
        </header>
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
