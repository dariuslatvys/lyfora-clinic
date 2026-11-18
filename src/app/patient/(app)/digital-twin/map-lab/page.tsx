import { redirect } from "next/navigation";

/** Moved to a shorter path so it is easier to open. */
export default function HealthMapLabRedirectPage() {
  redirect("/patient/map-lab");
}
