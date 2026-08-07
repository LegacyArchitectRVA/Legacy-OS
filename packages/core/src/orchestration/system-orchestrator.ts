export type PipelineStage =
  | 'queued'
  | 'ingesting'
  | 'normalizing'
  | 'deduplicating'
  | 'indexing'
  | 'persisting'
  | 'completed'
  | 'failed';

export interface PipelineJob {
  id: string;
  sourceId: string;
  stage: PipelineStage;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface PipelineResult {
  jobId: string;
  stage: PipelineStage;
  success: boolean;
  message: string;
}

/**
 * Coordinates LegacyOS ingestion lifecycle events.
 * This layer intentionally keeps connectors, storage, and indexing decoupled.
 */
export class SystemOrchestrator {
  private jobs = new Map<string, PipelineJob>();

  start(sourceId: string): PipelineJob {
    const now = new Date();
    const job: PipelineJob = {
      id: crypto.randomUUID(),
      sourceId,
      stage: 'queued',
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  advance(jobId: string, stage: PipelineStage): PipelineResult {
    const job = this.jobs.get(jobId);

    if (!job) {
      return {
        jobId,
        stage: 'failed',
        success: false,
        message: 'Pipeline job not found',
      };
    }

    job.stage = stage;
    job.updatedAt = new Date();

    return {
      jobId,
      stage,
      success: true,
      message: `Pipeline advanced to ${stage}`,
    };
  }

  get(jobId: string): PipelineJob | undefined {
    return this.jobs.get(jobId);
  }
}
