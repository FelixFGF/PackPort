import React, { useCallback, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { PackBridgeFlowProvider } from "./hooks/usePackBridgeFlow";
import { StepLayout } from "./layouts/StepLayout";
import { SEO } from "./components/SEO";
import { WelcomePage } from "./pages/WelcomePage";
import { ScanResultPage } from "./pages/ScanResultPage";
import { TargetPlatformPage } from "./pages/TargetPlatformPage";
import { UnsupportedModsPage } from "./pages/UnsupportedModsPage";
import { ConversionProgressPage } from "./pages/ConversionProgressPage";
import { FinishedPage } from "./pages/FinishedPage";
import { StartupLoader } from "./components/StartupLoader";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { AdminLayout } from "./layouts/AdminLayout";
import { WizardGuard } from "./guards/WizardGuard";

import AdminDashboardWelcomePage from "./pages/AdminDashboardWelcomePage";
import AdminDashboardAnalyticsPage from "./pages/AdminDashboardAnalyticsPage";
import AdminDashboardErrorsPage from "./pages/AdminDashboardErrorsPage";
import AdminDashboardLogsPage from "./pages/AdminDashboardLogsPage";
import AdminDashboardActivityPage from "./pages/AdminDashboardActivityPage";
import AdminDashboardConversionsPage from "./pages/AdminDashboardConversionsPage";
import AdminDashboardSystemPage from "./pages/AdminDashboardSystemPage";
import AdminDashboardSecurityPage from "./pages/AdminDashboardSecurityPage";
import AdminDashboardSettingsPage from "./pages/AdminDashboardSettingsPage";

import { AdminGuard } from "./guards/AdminGuard";
import { GlobalErrorReporter } from "./components/error/GlobalErrorReporter";

const HOME = {
  title: "PackPort.ddns.net | Home",
  description:
    "Convert CurseForge Modpacks to Modrinth automatically. Upload your modpack, convert it in seconds and download a ready-to-use .mrpack archive.",
  canonicalPath: "/",
};

const SCAN = {
  title: "PackPort | Scan",
  description:
    "PackPort is analyzing your uploaded CurseForge Modpack and detecting Minecraft version, mod loader and included mods.",
  canonicalPath: "/scan",
};

const OUTPUT = {
  title: "PackPort | Output",
  description:
    "Choose your desired output platform and prepare your converted Minecraft Modpack for export.",
  canonicalPath: "/target",
};

const PROBLEMS = {
  title: "PackPort | Problems",
  description:
    "Review unsupported or missing mods detected during conversion and see possible alternatives.",
  canonicalPath: "/unsupported-mods",
};

const CONVERT = {
  title: "PackPort | Convert",
  description:
    "PackPort is converting your CurseForge Modpack into a Modrinth compatible .mrpack archive.",
  canonicalPath: "/convert",
};

const FINISHED = {
  title: "PackPort | Finish 🎉",
  description:
    "Your Modpack has been successfully converted and is ready for download.",
  canonicalPath: "/finished",
};

export default function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const handleConnected = useCallback(() => {
    setIsBackendConnected(true);
  }, []);

  if (!isBackendConnected) {
    return <StartupLoader onConnected={handleConnected} />;
  }

  return (
    <HelmetProvider>
      <PackBridgeFlowProvider>
        <StepLayout>
          <GlobalErrorReporter>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <SEO config={HOME} />
                    <WelcomePage />
                  </>
                }
              />

              {/* Wizard routes only (scoped protection) */}
              <Route
                path="/scan"
                element={
                  <WizardGuard>
                    <>
                      <SEO config={SCAN} />
                      <ScanResultPage />
                    </>
                  </WizardGuard>
                }
              />
              <Route
                path="/target"
                element={
                  <WizardGuard>
                    <>
                      <SEO config={OUTPUT} />
                      <TargetPlatformPage />
                    </>
                  </WizardGuard>
                }
              />
              <Route
                path="/unsupported-mods"
                element={
                  <WizardGuard>
                    <>
                      <SEO config={PROBLEMS} />
                      <UnsupportedModsPage />
                    </>
                  </WizardGuard>
                }
              />
              <Route
                path="/convert"
                element={
                  <WizardGuard>
                    <>
                      <SEO config={CONVERT} />
                      <ConversionProgressPage />
                    </>
                  </WizardGuard>
                }
              />
              <Route
                path="/finished"
                element={
                  <WizardGuard>
                    <>
                      <SEO config={FINISHED} />
                      <FinishedPage />
                    </>
                  </WizardGuard>
                }
              />

              {/* Non-wizard routes */}
              <Route
                path="/admin"
                element={
                  <AdminLayout>
                    <AdminLoginPage />
                  </AdminLayout>
                }
              />

              {/* Protected admin dashboard (session validation via backend) */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <Navigate to="/admin/dashboard/welcome" replace />
                    </AdminGuard>
                  </AdminLayout>
                }
              />

              <Route
                path="/admin/dashboard/welcome"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardWelcomePage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/analytics"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardAnalyticsPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/errors"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardErrorsPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/logs"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardLogsPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/activity"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardActivityPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/conversions"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardConversionsPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/system"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardSystemPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/security"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardSecurityPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/dashboard/settings"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardSettingsPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />

              {/* Keep original dashboard page available if it is used elsewhere */}
              <Route
                path="/admin/dashboard/index"
                element={
                  <AdminLayout>
                    <AdminGuard>
                      <AdminDashboardPage />
                    </AdminGuard>
                  </AdminLayout>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </GlobalErrorReporter>
        </StepLayout>
      </PackBridgeFlowProvider>
    </HelmetProvider>
  );
}