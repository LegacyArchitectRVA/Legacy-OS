export type DemoFlowStep = {
  name: string;
  status: "pending" | "ready";
};

export const legacyOSDemoFlow: DemoFlowStep[] = [
  { name: "Create workspace", status: "ready" },
  { name: "Upload business knowledge", status: "ready" },
  { name: "Process documents", status: "ready" },
  { name: "Retrieve context", status: "ready" },
  { name: "Generate recommendation", status: "ready" },
  { name: "Create continuity action plan", status: "ready" },
];
