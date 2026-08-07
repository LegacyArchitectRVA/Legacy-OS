export type ScheduledTask = {
  id: string;
  workspaceId: string;
  taskType: 'review' | 'report' | 'alert';
  schedule: string;
  enabled: boolean;
};

export function createScheduledTask(task: ScheduledTask) {
  return {
    ...task,
    createdAt: new Date().toISOString(),
  };
}

export function getDueTasks(tasks: ScheduledTask[]) {
  return tasks.filter((task) => task.enabled);
}
