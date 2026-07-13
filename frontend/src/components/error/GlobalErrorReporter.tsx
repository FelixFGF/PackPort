import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { ReportErrorModal } from "./ReportErrorModal";
import { ErrorReportsService } from "../../services/ErrorReportsService";

type ReportContext = {
  conversionStep?: string | null;
  jobId?: string | null;
  logs?: string | null;

  minecraftVersion?: string | null;
  modpackName?: string | null;
  installedMods?: string | null;
  loader?: string | null;

  applicationVersion?: string | null;
};

const defaultContext: ReportContext = {
  conversionStep: null,
  jobId: null,
  logs: null,

  minecraftVersion: null,
  modpackName: null,
  installedMods: null,
  loader: null,

  applicationVersion: null,
};

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message || err.name;
  return safeString(err);
}

function getStacktrace(err: unknown): string {
  if (err instanceof Error) return err.stack || "";
  return "";
}

function getBrowserInfo(): string {
  try {
    return navigator.userAgent || "";
  } catch {
    return "";
  }
}

function getOsInfo(): string {
  try {
    const platform = (navigator as any).platform;
    const ua = navigator.userAgent;
    if (platform) return platform;
    return ua;
  } catch {
    return "";
  }
}

function getScreenResolution(): string {
  try {
    return `${window.screen.width}x${window.screen.height}`;
  } catch {
    return "";
  }
}

function buildReportPayload(err: unknown, ctx: ReportContext): {
  severity: string;
  errorMessage: string;
  stacktrace: string;
  jobId?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  minecraftVersion?: string | null;
  loader?: string | null;
  modpackName?: string | null;
  installedMods?: string | null;
  conversionStep?: string | null;
  userNotes?: string | null;
  logs?: string | null;
  applicationVersion?: string | null;
} {
  const message = getErrorMessage(err);
  const stack = getStacktrace(err);

  // Only include what we actually have; never auto-fill secrets.
  return {
    severity: "ERROR",
    errorMessage: message || "Unknown error",
    stacktrace: stack || "(no stacktrace)",
    jobId: ctx.jobId ?? null,
    browser: `${getBrowserInfo()}; ${getScreenResolution()}`.trim(),
    operatingSystem: getOsInfo(),
    minecraftVersion: ctx.minecraftVersion ?? null,
    loader: ctx.loader ?? null,
    modpackName: ctx.modpackName ?? null,
    installedMods: ctx.installedMods ?? null,
    conversionStep: ctx.conversionStep ?? null,
    userNotes: null,
    logs: ctx.logs ?? null,
    applicationVersion: ctx.applicationVersion ?? null,
  };
}

function usePackPortVersion(): string | null {
  return useMemo(() => {
    try {
      // Vite exposes env vars
      const v = (import.meta as any)?.env?.VITE_PACKPORT_VERSION;
      return typeof v === "string" && v ? v : null;
    } catch {
      return null;
    }
  }, []);
}

export class GlobalErrorReporterApi {
  private setContextFn: ((ctx: Partial<ReportContext>) => void) | null = null;

  attach(setContextFn: (ctx: Partial<ReportContext>) => void) {
    this.setContextFn = setContextFn;
  }

  setContext(ctx: Partial<ReportContext>) {
    this.setContextFn?.(ctx);
  }
}

export const globalErrorReporterApi = new GlobalErrorReporterApi();

export function GlobalErrorReporter(props: PropsWithChildren) {
  const packPortVersion = usePackPortVersion();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState<string | null>(null);

  const pendingErrorRef = useRef<unknown>(null);
  const [pendingErrorSummary, setPendingErrorSummary] = useState<string>("");

  const [context, setContext] = useState<ReportContext>(() => ({
    ...defaultContext,
    applicationVersion: packPortVersion,
  }));

  useEffect(() => {
    globalErrorReporterApi.attach((ctx) => {
      setContext((prev) => ({
        ...prev,
        ...ctx,
        applicationVersion: ctx.applicationVersion ?? packPortVersion ?? prev.applicationVersion,
      }));
    });
  }, [packPortVersion]);

  function openWithError(err: unknown) {
    pendingErrorRef.current = err;
    setPendingErrorSummary(getErrorMessage(err) || "Unknown error");
    setSubmitStatusText(null);
    setModalOpen(true);
  }

  async function submitReport() {
    const err = pendingErrorRef.current;
    if (!err) return;

    try {
      setIsSubmitting(true);
      setSubmitStatusText("Sending...");

      const payload = buildReportPayload(err, context);

      await ErrorReportsService.submitReport(payload);
      setSubmitStatusText("Report sent successfully.");
      // Keep modal open briefly; user may cancel.
      setTimeout(() => {
        setModalOpen(false);
        pendingErrorRef.current = null;
        setPendingErrorSummary("");
        setIsSubmitting(false);
      }, 900);
    } catch (e) {
      setSubmitStatusText(`Failed to send report.`);
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    // Unhandled promise rejections
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      openWithError(reason);
    };

    // Global JS runtime errors
    const onWindowError = (event: ErrorEvent) => {
      openWithError(event.error ?? event.message);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Render children normally; errors are also handled by ErrorBoundary below */}
      {props.children}

      <ReportErrorModal
        open={modalOpen}
        isSubmitting={isSubmitting}
        statusText={submitStatusText}
        title="🚨 Unexpected Error"
        message={
          <>
            PackPort detected an unexpected error.
            <div className="mt-2 text-neutral-300">
              If you choose "Send Report", diagnostic information will be sent to the developer to help improve PackPort.
              Nothing is uploaded automatically.
            </div>
          </>
        }
        details={
          <div className="text-neutral-200 leading-relaxed">
            <div className="font-semibold text-neutral-100">Possible information:</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Error message</li>
              <li>Stack trace</li>
              <li>Browser</li>
              <li>Operating system</li>
              <li>Screen resolution</li>
              <li>PackPort version</li>
              <li>Minecraft version</li>
              <li>Loader</li>
              <li>Modpack name</li>
              <li>Installed mods (when available)</li>
              <li>Current conversion step</li>
              <li>Job ID</li>
              <li>Timestamp</li>
              <li>Recent application logs</li>
            </ul>

            {pendingErrorSummary ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-neutral-200">
                <div className="font-semibold text-neutral-100">Error:</div>
                <pre className="mt-1 whitespace-pre-wrap">{pendingErrorSummary}</pre>
              </div>
            ) : null}
          </div>
        }
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          // Explicit consent only
          void submitReport();
        }}
      />
    </>
  );
}

export class GlobalErrorBoundary extends React.Component<
  PropsWithChildren,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Ask user explicitly via modal in GlobalErrorReporter
    // This boundary doesn't own the modal; it triggers global reporter if attached.
    try {
      // If the reporter is mounted, it will register its context API.
      // The modal open uses GlobalErrorReporter internal refs, but to keep additive behavior,
      // we simply throw again after capturing (so existing handlers can still work).
      // Instead, we open the modal by calling window event to avoid coupling.
      window.dispatchEvent(
        new CustomEvent("packport:global-error", { detail: { error } })
      );
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      // Do not swallow permanently: show fallback; existing app may rely on error boundaries.
      return this.props.children;
    }
    return this.props.children;
  }
}