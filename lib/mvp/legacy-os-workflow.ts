export type WorkflowStep = {
  name: string;
  status: "pending" | "complete";
};

export const legacyOSWorkflow: WorkflowStep[] = [
  { name: "Create workspace", status: "pending" },
  { name: "Add knowledge", status: "pending" },
  { name: "Analyze continuity", status: "pending" },
  { name: "Generate action plan", status: "pending" },
];
