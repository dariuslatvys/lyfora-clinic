"use client";

import { Fragment, type ReactNode } from "react";
import { AiProvider, useAi } from "@/components/patient/ai-context";
import { AiDrawer } from "@/components/patient/ai-drawer";
import { AiToggleButton } from "@/components/patient/patient-shell";

function ShellFrame({
  rail,
  main,
  locale,
  doctorName,
}: {
  rail: ReactNode;
  main: ReactNode;
  locale: "lt" | "en";
  doctorName: string;
}) {
  const { open } = useAi();
  return (
    <div className={open ? "app ai-open" : "app"}>
      <Fragment key="doctor-rail">{rail}</Fragment>
      <Fragment key="doctor-main">{main}</Fragment>
      <AiDrawer key="ai-drawer" locale={locale} patientName={doctorName} />
    </div>
  );
}

export function DoctorShell({
  locale,
  doctorName,
  rail,
  main,
}: {
  locale: "lt" | "en";
  doctorName: string;
  rail: ReactNode;
  main: ReactNode;
}) {
  return (
    <AiProvider apiPath="/api/doctor/ai" initialPatientId="patient_male">
      <ShellFrame
        locale={locale}
        doctorName={doctorName}
        rail={rail}
        main={main}
      />
    </AiProvider>
  );
}

export function DoctorAiToggle({ label }: { label: string }) {
  return <AiToggleButton label={label} />;
}
