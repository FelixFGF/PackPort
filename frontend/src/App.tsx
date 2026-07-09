import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PackBridgeFlowProvider } from "./hooks/usePackBridgeFlow";
import { StepLayout } from "./layouts/StepLayout";
import { WelcomePage } from "./pages/WelcomePage";
import { ScanResultPage } from "./pages/ScanResultPage";
import { TargetPlatformPage } from "./pages/TargetPlatformPage";
import { UnsupportedModsPage } from "./pages/UnsupportedModsPage";
import { ConversionProgressPage } from "./pages/ConversionProgressPage";
import { FinishedPage } from "./pages/FinishedPage";

export default function App() {
  return (
    <PackBridgeFlowProvider>
      <StepLayout>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/scan" element={<ScanResultPage />} />
          <Route path="/target" element={<TargetPlatformPage />} />
          <Route path="/unsupported-mods" element={<UnsupportedModsPage />} />
          <Route path="/convert" element={<ConversionProgressPage />} />
          <Route path="/finished" element={<FinishedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StepLayout>
    </PackBridgeFlowProvider>
  );
}