import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PackBridgeProfile,
  Platform,
  UnsupportedMod,
  UnsupportedModAction,
} from "../types/packbridge";

export type FlowStep =
  | "welcome"
  | "scan"
  | "target"
  | "unsupported-mods"
  | "convert"
  | "finished";

export type PackBridgeFlowState = {
  step: FlowStep;
  setStep: (step: FlowStep) => void;

  /**
   * Upload metadata only (never store the uploaded file/blob in frontend state).
   */
  uploadId?: string;

  /**
   * Backend conversion job id created during upload.
   * Used for polling /api/job/{jobId}.
   */
  jobId?: string;

  uploadFileName?: string;
  uploadFileSize?: number;
  uploadTimestamp?: string;
  uploadStatus?: string;

  /**
   * Typed setter for upload metadata so pages can store returned values.
   */
  setUploadMetadata: (m: {
    uploadId: string;
    jobId?: string;
    uploadFileName: string;
    uploadFileSize: number;
    uploadTimestamp: string;
    uploadStatus?: string;
  }) => void;

  /**
   * Clears upload metadata (used on reset).
   */
  clearUploadMetadata: () => void;

  profile?: PackBridgeProfile;
  unsupportedMods: UnsupportedMod[];

  // user decisions for unsupported mods
  setUnsupportedAction: (
    modId: string,
    action: UnsupportedModAction
  ) => void;

  // chosen target platform (from step 3)
  targetPlatform?: Platform;
  setTargetPlatform: (p: Platform) => void;

  // computed conversion result (mock)
  conversionResult?: {
    downloadName: string;
    downloadUrl: string; // object url
  };
  setConversionResult: (
    r: PackBridgeFlowState["conversionResult"]
  ) => void;

  // helpers
  resetFlow: () => void;
};

const PackBridgeFlowContext = createContext<PackBridgeFlowState | undefined>(
  undefined
);

const SESSION_KEY = "packport.wizard";

type PersistedWizard = {
  uploadId?: string;
  jobId?: string;
  uploadFileName?: string;
  currentStep?: FlowStep;
};

export function PackBridgeFlowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<FlowStep>("welcome");

  const [uploadId, setUploadId] = useState<string | undefined>();
  const [jobId, setJobId] = useState<string | undefined>();
  const [uploadFileName, setUploadFileName] = useState<string | undefined>();
  const [uploadFileSize, setUploadFileSize] = useState<number | undefined>();
  const [uploadTimestamp, setUploadTimestamp] = useState<string | undefined>();
  const [uploadStatus, setUploadStatus] = useState<string | undefined>();

  const hasRestoredRef = useRef(false);

  // Restore persisted wizard fields (frontend-only) on first render.
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedWizard;

      if (parsed?.uploadId) setUploadId(parsed.uploadId);
      if (parsed?.jobId) setJobId(parsed.jobId);
      if (parsed?.uploadFileName) setUploadFileName(parsed.uploadFileName);

      if (parsed?.currentStep) {
        const validSteps: FlowStep[] = [
          "welcome",
          "scan",
          "target",
          "unsupported-mods",
          "convert",
          "finished",
        ];
        if (validSteps.includes(parsed.currentStep)) {
          setStep(parsed.currentStep);
        }
      }
    } catch {
      // ignore (invalid JSON / storage disabled)
    }
  }, []);

  // Sync persisted fields to sessionStorage (frontend-only).
  useEffect(() => {
    try {
      const payload: PersistedWizard = {
        uploadId,
        jobId,
        uploadFileName,
        currentStep: step,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [uploadId, jobId, uploadFileName, step]);

  // No mock/default profile — real data comes from backend via job polling/pages.
  const [profile, setProfile] = useState<PackBridgeProfile | undefined>(undefined);

  // Keep decisions list empty until backend-derived data populates it via pages/actions.
  const [unsupportedMods, setUnsupportedMods] = useState<UnsupportedMod[]>([]);

  const [targetPlatform, setTargetPlatformState] = useState<Platform | undefined>(
    undefined
  );

  const [conversionResult, setConversionResult] = useState<
    PackBridgeFlowState["conversionResult"]
  >(undefined);

  const setUnsupportedAction = (
    modId: string,
    action: UnsupportedModAction
  ) => {
    setUnsupportedMods((prev) =>
      prev.map((m) =>
        m.modId === modId ? { ...m, recommendedAction: action } : m
      )
    );
  };

  const setTargetPlatform = (p: Platform) => {
    setTargetPlatformState(p);

    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, targetPlatform: p };
    });

    // unsupported mods are backend-driven; do not mutate list here
  };

  const setUploadMetadata = (m: {
    uploadId: string;
    jobId?: string;
    uploadFileName: string;
    uploadFileSize: number;
    uploadTimestamp: string;
    uploadStatus?: string;
  }) => {
    setUploadId(m.uploadId);
    if (m.jobId !== undefined) setJobId(m.jobId);
    setUploadFileName(m.uploadFileName);
    setUploadFileSize(m.uploadFileSize);
    setUploadTimestamp(m.uploadTimestamp);
    setUploadStatus(m.uploadStatus);
  };

  const clearUploadMetadata = () => {
    setUploadId(undefined);
    setJobId(undefined);
    setUploadFileName(undefined);
    setUploadFileSize(undefined);
    setUploadTimestamp(undefined);
    setUploadStatus(undefined);
  };

  const clearPersistedWizard = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  const resetFlow = () => {
    clearPersistedWizard();
    clearUploadMetadata();

    setProfile(undefined);
    setUnsupportedMods([]);
    setTargetPlatformState(undefined);
    setConversionResult(undefined);

    setStep("welcome");
  };

  const value: PackBridgeFlowState = {
    step,
    setStep,

    uploadId,
    jobId,
    uploadFileName,
    uploadFileSize,
    uploadTimestamp,
    uploadStatus,

    setUploadMetadata,
    clearUploadMetadata,

    profile,
    unsupportedMods,

    setUnsupportedAction,

    targetPlatform,
    setTargetPlatform,

    conversionResult,
    setConversionResult,

    resetFlow,
  };

  return (
    <PackBridgeFlowContext.Provider value={value}>
      {children}
    </PackBridgeFlowContext.Provider>
  );
}

export function usePackBridgeFlow(): PackBridgeFlowState {
  const ctx = useContext(PackBridgeFlowContext);
  if (!ctx) {
    throw new Error(
      "usePackBridgeFlow must be used within PackBridgeFlowProvider"
    );
  }
  return ctx;
}