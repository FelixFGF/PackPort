import React from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  details?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  statusText?: string | null;
};

export function ReportErrorModal(props: Props) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl">
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <span className="text-xl">🚨</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{props.title ?? "Unexpected Error"}</div>
              <div className="mt-1 text-sm text-neutral-300">
                {props.message ?? (
                  <>PackPort detected an unexpected error.</>
                )}
              </div>
            </div>
          </div>

          {props.details ? <div className="mt-4 text-sm text-neutral-200">{props.details}</div> : null}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          {props.statusText ? (
            <div className="mb-3 text-sm text-neutral-300">{props.statusText}</div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            <button
              type="button"
              className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-white/5 disabled:opacity-60"
              onClick={props.onCancel}
              disabled={props.isSubmitting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              onClick={props.onConfirm}
              disabled={props.isSubmitting}
            >
              {props.isSubmitting ? "Sending..." : "Send Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}