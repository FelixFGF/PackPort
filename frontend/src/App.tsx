import React, { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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

function AdminDashboardGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Temporary client-side guard:
  // until backend authentication is implemented, always redirect unauthenticated users to "/".
  // Later this will be replaced with backend session validation.
  const hasValidAdminSession = false;

  if (!hasValidAdminSession) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

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
            <Route
              path="/scan"
              element={
                <>
                  <SEO config={SCAN} />
                  <ScanResultPage />
                </>
              }
            />
            <Route
              path="/target"
              element={
                <>
                  <SEO config={OUTPUT} />
                  <TargetPlatformPage />
                </>
              }
            />
            <Route
              path="/unsupported-mods"
              element={
                <>
                  <SEO config={PROBLEMS} />
                  <UnsupportedModsPage />
                </>
              }
            />
            <Route
              path="/convert"
              element={
                <>
                  <SEO config={CONVERT} />
                  <ConversionProgressPage />
                </>
              }
            />
            <Route
              path="/finished"
              element={
                <>
                  <SEO config={FINISHED} />
                  <FinishedPage />
                </>
              }
            />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminDashboardGuard>
                  <AdminDashboardPage />
                </AdminDashboardGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StepLayout>
      </PackBridgeFlowProvider>
    </HelmetProvider>
  );
}