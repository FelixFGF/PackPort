export interface AdminActivityDto {
  id: string; // UUID as string
  timestampUtc: string; // OffsetDateTime serialized as ISO string
  username?: string | null;
  action?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  sessionId?: string | null;
}