export interface AuditEvent {
  workspaceId: string;
  userId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function createAuditEvent(
  event: AuditEvent
): AuditEvent {
  return {
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  };
}
