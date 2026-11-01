import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { MarketplaceView } from "@/components/patient/marketplace-view";

export default async function MarketplacePage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  return (
    <Suspense fallback={null}>
      <MarketplaceView locale={locale} />
    </Suspense>
  );
}
