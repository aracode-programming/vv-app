import { Suspense } from "react";

import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardView from "@/components/dashboard/DashboardView";
import AppShell from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <AppShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardView />
      </Suspense>
    </AppShell>
  );
}
