export type AuditEventType =
  | 'pipeline_started'
  | 'stage_completed'
  | 'stage_failed'
  | 'recovery_attempted';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  jobId: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

export interface RecoveryResult {
  recovered: boolean;
  jobId: string;
  action: string;
}

/**
 * Provides audit visibility and recovery hooks for LegacyOS pipelines.
 */
export class AuditRecoveryService {
  private events: AuditEvent[] = [];

  record(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const created: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    this.events.push(created);
    return created;
  }

  recover(jobId: string): RecoveryResult {
    this.record({
      type: 'recovery_attempted',
      jobId,
      details: { strategy: 'resume-from-last-known-state' },
    });

    return {
      recovered: true,
      jobId,
      action: 'resume-from-last-known-state',
    };
  }

  history(jobId: string): AuditEvent[] {
    return this.events.filter((event) => event.jobId === jobId);
  }
}
