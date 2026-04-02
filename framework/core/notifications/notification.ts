import { mergeProps } from "vue";
import { Content, NotificationOptions, NotificationPosition } from "@core/notifications/toast-types";
import { generateId, createLogger } from "@core/utilities";

const logger = createLogger("notification");

// ── Container backend (set by shell during plugin install) ───────────────────

interface NotificationBackend {
  defaultOptions: NotificationOptions;
  actions: {
    add(options: NotificationOptions): void;
    remove(id: string | number): void;
    clear(): void;
    dismiss(notificationId: string | number): void;
    update(option: NotificationOptions): void;
    setPosition(position: NotificationPosition): void;
  };
  getAllNotifications(): NotificationOptions[];
  appendInstance(options: NotificationOptions): void;
  getNotification(notificationId: string | number): NotificationOptions | undefined;
  hasNotification(notificationId: string | number): boolean;
}

let _backend: NotificationBackend | null = null;

/**
 * Shell registers the notification backend during plugin install.
 */
export function setNotificationBackend(backend: NotificationBackend): void {
  _backend = backend;
}

// ── Public API ───────────────────────────────────────────────────────────────

function showNotification(content: Content, options: NotificationOptions) {
  if (!_backend) {
    logger.debug("Backend not yet registered — notification call ignored.");
    return undefined;
  }

  options = mergeProps(
    _backend.defaultOptions as Record<string, unknown>,
    options as Record<string, unknown>,
  ) as NotificationOptions;

  if (
    !options.notificationId ||
    (typeof options.notificationId !== "string" && typeof options.notificationId !== "number")
  ) {
    options.notificationId = generateId();
  }

  options = {
    ...options,
    content,
  };

  _backend.appendInstance(options);
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
  _backend?.actions.clear();
};

notification.remove = (notificationId?: number | string) => {
  if (!_backend) return;
  if (notificationId) {
    _backend.actions.dismiss(notificationId);
  } else {
    _backend.actions.clear();
  }
};

notification.update = (notificationId: string | number, options: NotificationOptions) => {
  if (!_backend) return notificationId;

  if (!_backend.hasNotification(notificationId)) {
    logger.warn(`Cannot update: notification with ID ${notificationId} not found`);
    return notificationId;
  }

  const item = _backend.getNotification(String(notificationId));

  if (item) {
    if (options.position && options.position !== item.position) {
      const updatedOptions: NotificationOptions = {
        ...item,
        ...options,
        updateId: generateId(),
        notificationId: notificationId,
      };

      let contentToUse: Content | undefined;

      if (options.content !== undefined) {
        contentToUse = options.content;
        delete updatedOptions.content;
      } else if (item.content) {
        contentToUse = item.content;
        delete updatedOptions.content;
      }

      if (contentToUse) {
        _backend.actions.remove(notificationId);
        return showNotification(contentToUse, updatedOptions);
      }
    } else {
      const updateOptions = {
        ...options,
        updateId: generateId(),
        notificationId: notificationId,
      };

      _backend.actions.update(updateOptions);
      return notificationId;
    }
  }

  return notificationId;
};

notification.setPosition = (position: NotificationPosition) => {
  if (_backend) _backend.defaultOptions.position = position;
};

notification.clearPosition = (position: NotificationPosition) => {
  if (!_backend) return;

  const notificationsInPosition = _backend.getAllNotifications().filter(
    (item) => (item.position || _backend!.defaultOptions.position) === position,
  );

  notificationsInPosition.forEach((item) => {
    if (item.notificationId) {
      _backend!.actions.dismiss(item.notificationId);
    }
  });
};

notification.debug = () => {
  if (!_backend) {
    logger.debug("Backend not registered");
    return { active: [], defaultOptions: {} };
  }

  Object.entries(_backend.defaultOptions).forEach(([key, value]) => {
    logger.debug(`Default option ${key}: `, value);
  });

  Object.entries(_backend.actions).forEach(([key]) => {
    logger.debug(`Available action: ${key}`);
  });

  const groupedNotifications = _backend.getAllNotifications().reduce<
    Record<
      string,
      Array<{
        id: string | number;
        type?: string;
        content: string;
      }>
    >
  >((acc, item) => {
    const position = (item.position as string) || (_backend!.defaultOptions.position as string);

    if (!acc[position]) {
      acc[position] = [];
    }

    acc[position].push({
      id: item.notificationId || "unknown",
      type: item.type,
      content: typeof item.content === "string" ? item.content : "[Component]",
    });

    return acc;
  }, {});

  Object.entries(groupedNotifications).forEach(([position, items]) => {
    logger.debug(`Position ${position}: ${items.length} notifications`);
    items.forEach((item) => logger.debug(`  - ${item.id} (${item.type}): ${item.content}`));
  });

  return {
    active: _backend.getAllNotifications(),
    defaultOptions: _backend.defaultOptions,
  };
};

export { notification };
