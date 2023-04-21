import { mergeProps } from "vue";
import { NotificationOptions } from "../types";
import { useContainer } from "../composables";

const {
  defaultOptions,
  pending,
  actions,
  getNotification,
  getAllNotifications,
  appendInstance,
  generateNotificationId,
} = useContainer();

function checkPending(limit?: number) {
  const visibleCount = getAllNotifications().length;
  const limitCount = limit ?? 0;
  return limitCount > 0 && visibleCount + pending.items.length >= limitCount;
}

function resolvePending(options) {
  if (checkPending(options.limit)) {
    pending.items.push({
      notificationId: options.notificationId,
      notificationProps: options,
    });
  }
}

function showNotification(content: string, options: NotificationOptions) {
  options = mergeProps(defaultOptions as Record<string, unknown>, options as Record<string, unknown>);

  if (
    !options.notificationId ||
    (typeof options.notificationId !== "string" && typeof options.notificationId !== "number")
  ) {
    options.notificationId = generateNotificationId();
  }

  options = {
    ...options,
    content,
    closeNotification: () => notification.remove(options.notificationId),
  };

  resolvePending(options);

  if (!pending.items.length) {
    appendInstance(options);
  }

  return options.notificationId;
}

const notification = (content: string, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "default" });

notification.error = (content: string, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "error" });

notification.warning = (content: string, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "warning" });

notification.success = (content: string, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "success" });

notification.clearAll = () => {
  actions.clear();
};

notification.remove = (notificationId?: number | string) => {
  if (notificationId) {
    actions.dismiss(notificationId);
  } else {
    actions.clear();
  }
};

notification.update = (notificationId: string | number, options: NotificationOptions) => {
  const item = getNotification(String(notificationId));
  if (item) {
    const updatedOptions = {
      ...item,
      ...options,
      updateId: generateNotificationId(),
      notificationId: options.notificationId || notificationId,
    };

    const content = updatedOptions.content || item.content;
    delete updatedOptions.content;

    showNotification(content, updatedOptions);
  }
};

export { notification };
