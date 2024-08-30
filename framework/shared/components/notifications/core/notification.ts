import { mergeProps, h } from "vue";
import { Content, InternalNotificationOptions, NotificationOptions } from "../types";
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

function resolvePending(options: InternalNotificationOptions) {
  if (checkPending(options.limit) && options.notificationId) {
    pending.items.push({
      notificationId: options.notificationId,
      notificationProps: options,
    });
  }
}

function showNotification(content: Content, options: InternalNotificationOptions) {
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

const notification = (content: Content, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "default" });

notification.error = (content: Content, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "error" });

notification.warning = (content: Content, options?: NotificationOptions) =>
  showNotification(content, { ...options, type: "warning" });

notification.success = (content: Content, options?: NotificationOptions) =>
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

    if (content) showNotification(content, updatedOptions);
  }
};

export { notification };
