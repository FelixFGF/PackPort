export interface ApplicationLogDto {
  id: string; // UUID as string
  timestampUtc: string; // OffsetDateTime serialized as ISO string
  level?: string | null;
  source?: string | null;
  logger?: string | null;
  message?: string | null;
  exceptionText?: string | null;
  stacktrace?: string | null;
  jobId?: string | null;
  userAgent?: string | null;
  requestPath?: string | null;
  durationMs?: number | null;
  threadName?: string | null;
  correlationId?: string | null;
}