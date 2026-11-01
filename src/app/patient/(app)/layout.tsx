import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { PatientRail } from "@/components/patient/sidebar";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import {
  PatientShell,
  AiToggleButton,
} from "@/components/patient/patient-shell";

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
  const name = patientDisplayName(current.patient.sex, locale);

  async function logout() {
    "use server";
    await destroySession();
    redirect("/");
  }

  return (
    <PatientShell
      locale={locale}
      patientName={name}
      askAiLabel={labels.askAi}
      rail={
        <PatientRail
          labels={labels}
          patientName={name}
          sexLabel={
            current.patient.sex === "male" ? labels.sexMale : labels.sexFemale
          }
          logoutLabel={labels.signOut}
          logoutAction={logout}
        />
      }
      main={
        <div className="main">
          <header className="topbar">
            <div className="crumb">
              <b>{labels.patientPortal}</b>
              <span> · {labels.overview}</span>
            </div>
            <div className="sp" />
            <LocaleSwitch locale={locale} />
            <AiToggleButton label={labels.askAi} />
          </header>
          <div className="page">{children}</div>
        </div>
      }
    />
  );
}
