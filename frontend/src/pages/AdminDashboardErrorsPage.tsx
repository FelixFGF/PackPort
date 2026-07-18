import React from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardSection } from "../components/admin/dashboard/DashboardPrimitives";
import { ErrorReportsTable } from "../components/admin/errors/ErrorReportsTable";

export default function AdminDashboardErrorsPage() {
  return (
    <DashboardSection
      title="Errors"
      subtitle="Enterprise error reporting center with stacktrace, system info, and resolution actions."
    >
      <ErrorReportsTable />
    </DashboardSection>
  );
}