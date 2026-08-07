export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface PipelinePayload {
  id: string;
  sourceId: string;
  records: unknown[];
}

/**
 * Pre-execution validation gate for LegacyOS pipelines.
 * Provides a single location for quality checks before processing.
 */
export class ValidationGate {
  validate(payload: PipelinePayload): ValidationResult {
    const checks: ValidationCheck[] = [
      {
        name: 'payload-id',
        passed: Boolean(payload.id),
        details: payload.id ? 'Payload identifier present' : 'Missing payload identifier',
      },
      {
        name: 'source-id',
        passed: Boolean(payload.sourceId),
        details: payload.sourceId ? 'Source identifier present' : 'Missing source identifier',
      },
      {
        name: 'records',
        passed: Array.isArray(payload.records),
        details: Array.isArray(payload.records) ? 'Records collection valid' : 'Invalid records collection',
      },
    ];

    return {
      passed: checks.every((check) => check.passed),
      checks,
    };
  }
}
