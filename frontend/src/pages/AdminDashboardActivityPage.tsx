import React from "react";
import { DashboardSection } from "../components/admin/dashboard/DashboardPrimitives";
import { LiveActivityFeed } from "../components/admin/activity/LiveActivityFeed";

export default function AdminDashboardActivityPage() {
  return (
    <DashboardSection
      title="Activity"
      subtitle="Live admin activity, uploads, conversions, error reports, and system events."
    >
      <LiveActivityFeed />
    </DashboardSection>
  );
}