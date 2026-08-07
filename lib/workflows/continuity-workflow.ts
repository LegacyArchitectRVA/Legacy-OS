export interface ContinuityWorkflow {
  name: string;
  steps: string[];
}

export const defaultContinuityWorkflow: ContinuityWorkflow = {
  name: "LegacyOS Continuity Review",
  steps: [
    "Collect operational knowledge",
    "Analyze continuity risks",
    "Generate recommendations",
    "Create action plan"
  ]
};
