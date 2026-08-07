export type Notification = {
  workspaceId: string;
  type: 'risk' | 'review' | 'update';
  message: string;
};

export function createNotification(notification: Notification) {
  return {
    ...notification,
    createdAt: new Date().toISOString(),
  };
}
