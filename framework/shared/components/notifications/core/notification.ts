import { mergeProps } from "vue";
import { Content, InternalNotificationOptions, NotificationOptions, NotificationPosition } from "../types";
import { useContainer } from "../composables/useContainer";

const {
  defaultOptions,
  pending,
  actions,
  getNotification,
  getAllNotifications,
  appendInstance,
  generateNotificationId,
  hasNotification,
} = useContainer();

function checkPending(limit?: number, position?: NotificationPosition) {
  // If position is not specified, use the default position
  const posToCheck = position || (defaultOptions.position as NotificationPosition);
  const limitCount = limit ?? 0;

  // Check the limit for a specific position
  const visibleCount = getAllNotifications().filter(
    (notification) => (notification.position || defaultOptions.position) === posToCheck,
  ).length;

  return (
    limitCount > 0 && visibleCount + pending.items.filter((item) => item.position === posToCheck).length >= limitCount
  );
}

function resolvePending(options: InternalNotificationOptions) {
  const position = options.position || (defaultOptions.position as NotificationPosition);

  if (checkPending(options.limit, position) && options.notificationId) {
    pending.items.push({
      notificationId: options.notificationId,
      notificationProps: options,
      position,
    });
    return true;
  }
  return false;
}

function showNotification(content: Content, options: InternalNotificationOptions) {
  options = mergeProps(
    defaultOptions as Record<string, unknown>,
    options as Record<string, unknown>,
  ) as InternalNotificationOptions;

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

  // If this is an update (has updateId), don't check the limit and don't add to the waiting queue
  if (options.updateId) {
    appendInstance(options);
    return options.notificationId;
  }

  // If the notification has been added to the queue, just return the ID
  if (resolvePending(options)) {
    return options.notificationId;
  }

  // Otherwise, display it
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
    console.warn(`Cannot update: notification with ID ${notificationId} not found`);
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

  // Remove pending notifications for this position
  pending.items = pending.items.filter((item) => item.position !== position);
};

// Useful debugging method
notification.debug = () => {
  // Default settings information
  Object.entries(defaultOptions).forEach(([key, value]) => {
    console.log(`Default option ${key}: `, value);
  });

  // Available actions
  Object.entries(actions).forEach(([key]) => {
    console.log(`Available action: ${key}`);
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
    console.log(`Position ${position}: ${items.length} notifications`);
    items.forEach((item) => console.log(`  - ${item.id} (${item.type}): ${item.content}`));
  });

  // Collect statistics on pending notifications
  console.log(`Pending notifications: ${pending.items.length}`);
  pending.items.forEach((item) => {
    console.log(`  - ${item.notificationId} (position: ${item.position})`);
  });

  return {
    active: getAllNotifications(),
    pending: pending.items,
    defaultOptions,
  };
};

export { notification };
