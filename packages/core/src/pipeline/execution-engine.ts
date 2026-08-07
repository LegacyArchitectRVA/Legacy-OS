import { SystemOrchestrator } from '../orchestration/system-orchestrator';

export interface PipelineStep {
  name: string;
  execute(payload: unknown): Promise<unknown>;
}

export interface ExecutionResult {
  jobId: string;
  success: boolean;
  completedSteps: string[];
  error?: string;
}

export class PipelineExecutionEngine {
  constructor(private readonly orchestrator: SystemOrchestrator) {}

  async execute(sourceId: string, steps: PipelineStep[]): Promise<ExecutionResult> {
    const job = this.orchestrator.start(sourceId);
    const completedSteps: string[] = [];
    let payload: unknown = { sourceId };

    try {
      for (const step of steps) {
        this.orchestrator.advance(job.id, 'ingesting');
        payload = await step.execute(payload);
        completedSteps.push(step.name);
      }

      this.orchestrator.advance(job.id, 'completed');

      return {
        jobId: job.id,
        success: true,
        completedSteps,
      };
    } catch (error) {
      this.orchestrator.advance(job.id, 'failed');

      return {
        jobId: job.id,
        success: false,
        completedSteps,
        error: error instanceof Error ? error.message : 'Unknown pipeline failure',
      };
    }
  }
}
