import React, { useCallback, useId, useMemo } from "react";
import { Upload } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

export type UploadZoneProps = {
  fileName?: string;
  onFileSelected: (file: File) => void;
};

export function UploadZone({ fileName, onFileSelected }: UploadZoneProps) {
  const inputId = useId();

  const labelText = useMemo(() => {
    if (!fileName) return "Select a profile file";
    return `Selected: ${fileName}`;
  }, [fileName]);

  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      onFileSelected(file);
      // allow re-selecting the same file
      e.target.value = "";
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div className="w-full">
      <div
        className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-sm"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={onDrop}
      >
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-white/10">
          <Upload className="h-5 w-5 text-indigo-200" />
        </div>

        <div className="text-sm font-semibold text-zinc-50">{labelText}</div>
        <div className="mt-1 text-xs text-zinc-300">
          Drag & drop your profile bundle or use the file picker.
        </div>

        <div className="mt-4">
          {/* Ensure clicking always hits the <label htmlFor> target. */}
          <label htmlFor={inputId} className="cursor-pointer">
            {/* PrimaryButton is a button element; nesting it in a label is allowed,
                but for maximum click reliability we keep the label as the click target
                and ensure no overlay blocks pointer events. */}
            <div className="pointer-events-none">
              <PrimaryButton className="max-w-full" type="button">
                Choose file
              </PrimaryButton>
            </div>
          </label>

          {/* Visually hidden but clickable via label (not display:none). */}
          <input
            id={inputId}
            name="profileFile"
            type="file"
            accept=".zip,.mrpack"
            className="sr-only"
            onChange={onPickFile}
          />
        </div>
      </div>
    </div>
  );
}