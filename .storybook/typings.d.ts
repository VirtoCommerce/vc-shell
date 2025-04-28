interface NotificationAPI {
  success: (content: any, options?: any) => any;
  error: (content: any, options?: any) => any;
  warning: (content: any, options?: any) => any;
  clearAll: () => void;
  remove: (notificationId?: number | string) => void;
  update: (notificationId: string | number, options: any) => void;
}

interface AssetsManagerAPI {
  // add empty interface, which can be extended when needed
}

interface Window {
  notification: NotificationAPI;
  AssetsManager: AssetsManagerAPI;
  global: Window;
}
