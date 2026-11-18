import { redirect } from "next/navigation";

/** Calendar merged into Visits & calendar. */
export default function PatientCalendarRedirectPage() {
  redirect("/patient/visits");
}
