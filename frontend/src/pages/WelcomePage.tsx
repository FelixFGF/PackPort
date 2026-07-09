import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadZone } from "../components/UploadZone";
import { PrimaryButton } from "../components/PrimaryButton";
import { usePackBridgeFlow } from "../hooks/usePackBridgeFlow";
import LoadingModal from "../components/LoadingModal";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type UploadResponse = {
  uploadId: string;
  fileName: string;
  size: number;
  status: string;

  // backend-driven scan/conversion job id
  jobId?: string;
};

const API_BASE = "";

function toApiUrl(path: string) {
  return `${API_BASE}${path}`;
}

function cleanupUpload(uploadId: string | undefined) {
  if (!uploadId) return;

  const url = toApiUrl(`/api/upload/${encodeURIComponent(uploadId)}`);

  // Prefer sendBeacon for unload reliability.
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    try {
      navigator.sendBeacon(url);
      return;
    } catch {
      // fall through
    }
  }

  fetch(url, { method: "DELETE", keepalive: true }).catch(() => {});
}

export function WelcomePage() {
  const navigate = useNavigate();
  const flow = usePackBridgeFlow();
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Optional export base name (without suffix/extension).
  // Sent as multipart field exportNameBase.
  const [exportNameBase, setExportNameBase] = useState<string>("");

  const registerBeforeUnload = useCallback(
    (uploadId: string) => {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        cleanupUpload(uploadId);
      };

      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    },
    []
  );

  // Ensure best-effort cleanup when leaving the page (refresh/back).
  useEffect(() => {
    const handler = () => cleanupUpload(flow.uploadId);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [flow.uploadId]);

  const accept = useMemo(() => ".zip,.mrpack", []);

  const onUploadContinue = async () => {
    setErrorMessage(undefined);

    if (!selectedFile) {
      setErrorMessage("Please upload a .zip or .mrpack file first.");
      return;
    }

    const lower = selectedFile.name.toLowerCase();
    const isZip = lower.endsWith(".zip");
    const isMrpack = lower.endsWith(".mrpack");

    if (!isZip && !isMrpack) {
      setErrorMessage("Only .zip and .mrpack files are allowed.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    if (exportNameBase.trim().length > 0) {
      formData.append("exportNameBase", exportNameBase.trim());
    }

    try {
      const res = await fetch(toApiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Upload failed (${res.status}). ${text}`.trim());
      }

      const json: ApiResponse<UploadResponse> = await res.json();

      // Debugging: verify backend upload response shape during flow issues.
      console.log("UPLOAD RESPONSE:", json);

      if (!json?.success || !json?.data?.uploadId) {
        throw new Error(json?.message || "Upload failed: invalid server response.");
      }

      const upload = json.data;

      if (!upload.jobId) {
        throw new Error("Upload failed: backend did not return jobId. Cannot start scan.");
      }

      flow.setUploadMetadata({
        uploadId: upload.uploadId,
        jobId: upload.jobId,
        uploadFileName: upload.fileName,
        uploadFileSize: upload.size,
        uploadTimestamp: new Date().toISOString(),
        uploadStatus: upload.status,
      });

      // Register warning + cleanup for unload.
      const disposer = registerBeforeUnload(upload.uploadId);

      // Navigate to Scan page only after jobId is available.
      setLoading(false);
      navigate("/scan");

      // After navigation, remove listener to avoid leaks.
      queueMicrotask(() => disposer());
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setErrorMessage(msg);
      return;
    } finally {
      // Never keep the File object after upload finishes.
      setSelectedFile(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold">Upload your modpack</h1>
        <p className="text-sm text-slate-600">
          Upload a CurseForge zip or a Modrinth .mrpack. We’ll preserve as much information as possible during conversion.
        </p>

        <UploadZone
          onFileSelected={(file: File) => {
            setErrorMessage(undefined);
            setSelectedFile(file);
          }}
        />

        {errorMessage ? (
          <div className="w-full rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-200 mb-1">
            Export filename (base name)
          </label>
          <input
            value={exportNameBase}
            onChange={(e) => setExportNameBase(e.target.value)}
            placeholder="e.g. Verity SMP"
            className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/70"
          />
          <div className="mt-1 text-xs text-slate-500">
            Extension and PackPort suffix are added automatically.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton onClick={onUploadContinue} disabled={!selectedFile}>
            Continue
          </PrimaryButton>

          {selectedFile ? (
            <div className="text-xs text-slate-600">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">No file selected</div>
          )}
        </div>

        <span className="hidden">{accept}</span>
      </div>
      <LoadingModal open={loading} />
    </div>
  );
}
