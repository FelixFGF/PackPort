import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import { useJobStatus } from "../hooks/useJobStatus";

export function WizardGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { jobId } = usePackBridgeFlow();
  const { status } = useJobStatus(jobId);

  // Only apply wizard-step protection when entering wizard routes.
  useEffect(() => {
    const isWizardRoute = [
      "/scan",
      "/target",
      "/unsupported-mods",
      "/convert",
      "/finished",
    ].includes(location.pathname);

    if (!isWizardRoute) return;

    if (!jobId && status !== "DONE" && status !== "FAILED") {
      navigate("/", { replace: true });
    }
  }, [jobId, location.pathname, navigate, status]);

  return <>{children}</>;
}