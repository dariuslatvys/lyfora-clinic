import { redirect } from "next/navigation";

/** Experimental map lives under Apžvalga tabs now. */
export default function HealthMapLabPage() {
  redirect("/patient/digital-twin?view=lab");
}
