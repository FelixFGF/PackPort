export type ErrorReportDto = {
  id: string;
  timestampUtc?: string | null;

  severity?: string | null;
  errorMessage?: string | null;
  stacktrace?: string | null;

  jobId?: string | null;

  browser?: string | null;
  operatingSystem?: string | null;

  minecraftVersion?: string | null;
  loader?: string | null;
  modpackName?: string | null;
  installedMods?: string | null;

  applicationVersion?: string | null;
  logs?: string | null;
  userNotes?: string | null;

  resolved?: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
};

export type ErrorReportSubmissionPayload = {
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
};