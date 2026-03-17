import { LayoutDashboard } from "lucide-react";
import { AdminLayout } from "../../components/AdminLayout";

import { DashboardWelcomeBanner } from "./components/DashboardWelcomeBanner";
import { TotalRespondenCard } from "./components/TotalRespondenCard";
import { UsiaProduktifCard } from "./components/UsiaProduktifCard";
import { KlasterTerbanyakCard } from "./components/KlasterTerbanyakCard";
import { ClusterDistributionChart } from "./components/ClusterDistributionChart";
import { ClusterProportionDetails } from "./components/ClusterProportionDetails";
import { RecentSubmissionsTable } from "./components/RecentSubmissionsTable";
import { FeatureInfoCards } from "./components/FeatureInfoCards";

export default function AdminLanding() {
  return (
    <AdminLayout title="Dashboard" headerIcon={<LayoutDashboard className="w-4 h-4" />}>
      {/* ── WELCOME BANNER ── */}
      <DashboardWelcomeBanner />

      {/* ── TOP STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <TotalRespondenCard />
        <UsiaProduktifCard />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* KLASTER TERBANYAK STAT */}
        <div className="lg:col-span-1 isolate">
          <KlasterTerbanyakCard />
        </div>

        {/* BAR CHART */}
        <div className="lg:col-span-1 isolate">
          <ClusterDistributionChart />
        </div>

        {/* CLUSTER DETAILS */}
        <div className="lg:col-span-1 isolate">
          <ClusterProportionDetails />
        </div>
      </div>

      {/* ── RECENT SUBMISSIONS ── */}
      <div className="mt-8">
        <RecentSubmissionsTable />
      </div>

      {/* ── FEATURE INFO CARDS ── */}
      <FeatureInfoCards />

    </AdminLayout>
  );
}
