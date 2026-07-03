import DashboardContent from "@/components/dashboard/DashboardContent";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";

export default async function DashboardView() {
  const data = await getDashboardData();
  return <DashboardContent data={data} />;
}
