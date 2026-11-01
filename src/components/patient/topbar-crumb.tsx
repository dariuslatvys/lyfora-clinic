"use client";

import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function TopbarCrumb({ labels }: { labels: Dictionary }) {
  const pathname = usePathname() || "";

  const section = (() => {
    if (pathname.startsWith("/patient/dna")) return labels.myDna;
    if (pathname.startsWith("/patient/analytics")) return labels.analytics;
    if (pathname.startsWith("/patient/privacy")) return labels.privacy;
    if (pathname.startsWith("/patient/marketplace")) return labels.marketplace;
    if (pathname.startsWith("/patient/labs")) return labels.labs;
    if (pathname.startsWith("/patient/health-card")) return labels.healthCard;
    if (pathname.startsWith("/patient/consultations")) return labels.consultations;
    if (pathname.startsWith("/patient/visits")) return labels.visits;
    if (pathname.startsWith("/patient/referrals")) return labels.referrals;
    if (pathname.startsWith("/patient/prescriptions")) return labels.prescriptions;
    if (pathname.startsWith("/patient/recommendations"))
      return labels.recommendations;
    if (pathname.startsWith("/patient/uploads")) return labels.uploads;
    if (pathname.startsWith("/patient/integrations")) return labels.integrations;
    if (pathname.startsWith("/patient/urgent")) return labels.urgentConsult;
    if (pathname.startsWith("/patient/questions")) return labels.questions;
    if (pathname.startsWith("/patient/digital-twin")) return labels.overview;
    if (pathname.startsWith("/patient/snp")) return labels.genes;
    if (pathname.startsWith("/patient/marker")) return labels.markers;
    return labels.overview;
  })();

  return (
    <div className="crumb">
      <b>{labels.patientPortal}</b>
      <span> · {section}</span>
    </div>
  );
}
