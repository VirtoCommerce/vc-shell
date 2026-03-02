import { mergeProps } from "vue";
import { Content, NotificationOptions, NotificationPosition } from "@shared/components/notifications/types";
import { useContainer } from "@shared/components/notifications/composables/useContainer";
import { createLogger } from "@core/utilities";

const logger = createLogger("notification");

const {
  defaultOptions,
  actions,
  getNotification,
  getAllNotifications,
  appendInstance,
  generateNotificationId,
  hasNotification,
} = useContainer();

function showNotification(content: Content, options: NotificationOptions) {
  options = mergeProps(
    defaultOptions as Record<string, unknown>,
    options as Record<string, unknown>,
  ) as NotificationOptions;

  if (
    !options.notificationId ||
    (typeof options.notificationId !== "string" && typeof options.notificationId !== "number")
  ) {
    options.notificationId = generateNotificationId();
  }

  options = {
    ...options,
    content,
  };

  appendInstance(options);
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
  // Check if notification exists
  if (!hasNotification(notificationId)) {
    logger.warn(`Cannot update: notification with ID ${notificationId} not found`);
    return notificationId;
  }

  // Get the current notification
  const item = getNotification(String(notificationId));

  if (item) {
    // First update option: if the position changes, recreate the notification
    if (options.position && options.position !== item.position) {
      // Create new options with required fields
      const updatedOptions: NotificationOptions = {
        ...item, // Copy all current properties
        ...options, // Apply new properties
        updateId: generateNotificationId(), // Mark as update
        notificationId: notificationId, // Keep the original ID
      };

      // Determine content for update
      let contentToUse: Content | undefined;

      // If new content is explicitly provided, use it
      if (options.content !== undefined) {
        contentToUse = options.content;
        delete updatedOptions.content; // Remove content from options
      }
      // Otherwise use existing content
      else if (item.content) {
        contentToUse = item.content;
        delete updatedOptions.content; // Remove content from options
      }

      // Proceed with the update only if there is content
      if (contentToUse) {
        // Remove the old notification
        actions.remove(notificationId);
        // Create a new one with the new position
        return showNotification(contentToUse, updatedOptions);
      }
    }
    // Second option: update content without changing position
    else {
      // Use direct update through actions.update
      const updateOptions = {
        ...options,
        updateId: generateNotificationId(),
        notificationId: notificationId,
      };

      // If we're only updating content, use a special method
      if (options.content !== undefined) {
        // Apply the update directly through actions
        const result = actions.update(updateOptions);
        return notificationId;
      } else {
        // Update other properties
        const result = actions.update(updateOptions);
        return notificationId;
      }
    }
  }

  return notificationId;
};

// New method for setting notification position
notification.setPosition = (position: NotificationPosition) => {
  defaultOptions.position = position;
};

// New method for clearing notifications only in a specific position
notification.clearPosition = (position: NotificationPosition) => {
  // Find all notifications in the specified position
  const notificationsInPosition = getAllNotifications().filter(
    (item) => (item.position || defaultOptions.position) === position,
  );

  // Remove each notification
  notificationsInPosition.forEach((item) => {
    if (item.notificationId) {
      actions.dismiss(item.notificationId);
    }
  });
};

// Useful debugging method
notification.debug = () => {
  // Default settings information
  Object.entries(defaultOptions).forEach(([key, value]) => {
    logger.debug(`Default option ${key}: `, value);
  });

  // Available actions
  Object.entries(actions).forEach(([key]) => {
    logger.debug(`Available action: ${key}`);
  });

  // Collect statistics on notifications in different positions
  const groupedNotifications = getAllNotifications().reduce<
    Record<
      string,
      Array<{
        id: string | number;
        type?: string;
        content: string;
      }>
    >
  >((acc, item) => {
    const position = (item.position as string) || (defaultOptions.position as string);

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

  // Display group information
  Object.entries(groupedNotifications).forEach(([position, items]) => {
    logger.debug(`Position ${position}: ${items.length} notifications`);
    items.forEach((item) => logger.debug(`  - ${item.id} (${item.type}): ${item.content}`));
  });

  return {
    active: getAllNotifications(),
    defaultOptions,
  };
};

export { notification };
