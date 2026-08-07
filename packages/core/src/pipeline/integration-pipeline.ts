export interface PipelineContext {
  sourceId: string;
  records: unknown[];
  validated: boolean;
  indexed: boolean;
  persisted: boolean;
}

export interface PipelineStep {
  name: string;
  execute(context: PipelineContext): Promise<PipelineContext>;
}

export class IntegrationPipeline {
  constructor(private readonly steps: PipelineStep[]) {}

  async run(context: PipelineContext): Promise<PipelineContext> {
    let current = context;

    for (const step of this.steps) {
      current = await step.execute(current);
    }

    return current;
  }
}
