import { createApp, nextTick, reactive, ref, Ref } from "vue";
import { NotificationOptions, NotificationPosition } from "@shared/components/notifications/types";
import { NotificationContainer } from "@shared/components/notifications/components";
import { useInstance } from "@shared/components/notifications/composables/useInstance";
import * as _ from "lodash-es";
import { generateId, createLogger } from "@core/utilities";

const logger = createLogger("notification-container");

interface IUseContainer {
  defaultOptions: NotificationOptions;
  notificationContainers: Record<NotificationPosition, Ref<NotificationOptions[]>>;
  actions: {
    add(options: NotificationOptions): void;
    remove(id: string | number): void;
    clear(): void;
    dismiss(notificationId: string | number): void;
    update(option: NotificationOptions): void;
    setPosition(position: NotificationPosition): void;
  };
  getAllNotifications(): NotificationOptions[];
  getNotificationsByPosition(position: NotificationPosition): NotificationOptions[];
  appendInstance(options: NotificationOptions): void;
  generateNotificationId(): string;
  getNotification(notificationId: string | number): NotificationOptions | undefined;
  hasNotification(notificationId: string | number): boolean;
}

// Create containers for each position
const notificationContainers: Record<NotificationPosition, Ref<NotificationOptions[]>> = {
  "top-center": ref([]),
  "top-right": ref([]),
  "top-left": ref([]),
  "bottom-center": ref([]),
  "bottom-right": ref([]),
  "bottom-left": ref([]),
};

const { clearContainer, unmountComponent, saveInstance, getInstanceByPosition } = useInstance();

export function useContainer(): IUseContainer {
  const defaultOptions = reactive<NotificationOptions>({
    timeout: 3000,
    pauseOnHover: true,
    position: "top-center",
  });

  function getAllNotifications() {
    // Combine notifications from all positions
    return Object.values(notificationContainers).flatMap((container) => container.value);
  }

  function getNotificationsByPosition(position: NotificationPosition) {
    return notificationContainers[position].value;
  }

  function getNotification(notificationId: string | number) {
    return getAllNotifications().find((item) => item.notificationId === notificationId);
  }

  function generateRoot(position: NotificationPosition) {
    const rootInstance = document.querySelector(".notification");
    const container = rootInstance || document.createElement("div");

    // Check if a container already exists for the specified position
    const positionSelector = `.notification__container[data-position="${position}"]`;
    let renderRoot = document.querySelector(positionSelector) as HTMLElement | null;

    // If there is no container for this position, create a new one
    if (!renderRoot) {
      renderRoot = document.createElement("div");
      renderRoot.className = "notification__container";
      renderRoot.id = `notification-${position}`;
      renderRoot.setAttribute("data-position", position);

      if (!rootInstance) {
        container.className = "notification";
        document.body.appendChild(container);
      }

      container.appendChild(renderRoot);
    }

    return renderRoot;
  }

  function appendInstance(options: NotificationOptions) {
    // Determine the notification position
    const position = options.position || (defaultOptions.position as NotificationPosition);

    // Check if an instance already exists for this position
    const existingInstance = getInstanceByPosition(position);

    if (!existingInstance) {
      // Create a new root element for the position
      const dom = generateRoot(position);
      const instance = createApp(NotificationContainer, {
        ...(options as Record<string, unknown>),
        position, // Pass the position to the component
      });
      instance.mount(dom);
      saveInstance(instance, dom.id, position);
    }

    nextTick(() => {
      if (options.updateId) {
        actions.update(options);
      } else {
        actions.add(options);
      }
    });
  }

  function hasNotification(notificationId: string | number): boolean {
    return getAllNotifications().some((item) => item.notificationId === notificationId);
  }

  const actions = {
    add(options: NotificationOptions) {
      const position = options.position || (defaultOptions.position as NotificationPosition);
      const containers = notificationContainers[position];

      if (!containers.value.find((item) => item.notificationId === options.notificationId)) {
        nextTick(() => {
          containers.value.push(options);
          if (options.onOpen && typeof options?.onOpen === "function") {
            options.onOpen(options.payload);
          }
        });
      }
    },

    remove(id: string | number) {
      if (id) {
        // Find the notification among all containers
        let notification: NotificationOptions | undefined;
        let positionToRemoveFrom: NotificationPosition | undefined;

        // Search in which container the notification is located
        Object.entries(notificationContainers).forEach(([pos, container]) => {
          const found = container.value.find((item) => item.notificationId === id);
          if (found) {
            notification = found;
            positionToRemoveFrom = pos as NotificationPosition;
          }
        });

        if (positionToRemoveFrom) {
          // Remove the notification from the corresponding container
          notificationContainers[positionToRemoveFrom].value = notificationContainers[
            positionToRemoveFrom
          ].value.filter((item) => item.notificationId !== id);

          // If container is empty, unmount it
          if (notificationContainers[positionToRemoveFrom].value.length === 0) {
            unmountComponent(positionToRemoveFrom);
          }

          // Call the onClose callback
          nextTick(() => {
            if (notification?.onClose && typeof notification?.onClose === "function") {
              notification.onClose(notification.payload);
            }
          });
        }
      }
    },

    clear() {
      clearContainer();
      // Clear all containers
      Object.values(notificationContainers).forEach((container) => {
        container.value = [];
      });
    },

    dismiss(notificationId: string | number) {
      if (!notificationId) return;

      // Mark the notification as dismissing — VcToast watches this flag
      // and handles its own exit animation, then emits 'close' when done.
      let found = false;
      Object.values(notificationContainers).forEach((container) => {
        container.value.forEach((item) => {
          if (item.notificationId === notificationId) {
            item.dismissing = true;
            found = true;
          }
        });
      });

      // If notification wasn't found (already removed or never existed), no-op
      if (!found) {
        logger.debug(`dismiss: notification ${notificationId} not found`);
      }
    },

    update(option: NotificationOptions) {
      if (option.updateId) {
        // Find the notification across all containers
        let notification: NotificationOptions | undefined;
        let containerToUpdate: Ref<NotificationOptions[]> | undefined;
        let containerPosition: NotificationPosition | undefined;

        // First check all containers
        Object.entries(notificationContainers).forEach(([pos, container]) => {
          const found = container.value.find((item) => item.notificationId === option.notificationId);
          if (found) {
            notification = found;
            containerToUpdate = container;
            containerPosition = pos as NotificationPosition;
          }
        });

        // If we found the notification and container to update
        if (notification && containerToUpdate) {
          logger.debug(`Updating notification ${option.notificationId} in position ${containerPosition}`);

          // If the position changes, move the notification between containers
          if (option.position && option.position !== containerPosition) {
            // Remove from current container
            containerToUpdate.value = containerToUpdate.value.filter(
              (item) => item.notificationId !== option.notificationId,
            );

            // Create updated notification with new properties
            const updatedNotification = {
              ...notification,
              ...option,
            };

            // Define target position
            const targetPosition = option.position;

            // Check if a container already exists for the target position
            if (!getInstanceByPosition(targetPosition)) {
              // If no container exists for the target position, create a new one
              logger.debug(`Creating new container for position ${targetPosition}`);
              appendInstance(updatedNotification);
            } else {
              // If a container exists for the target position, add the updated notification
              logger.debug(`Adding to existing container for position ${targetPosition}`);
              notificationContainers[targetPosition].value.push(updatedNotification);
            }
          } else {
            // Standard update of notification properties
            logger.debug(`Standard update of notification properties`);

            // Apply all new properties from option to notification
            Object.keys(option).forEach((key) => {
              if (key !== "updateId" && key !== "notificationId") {
                const propKey = key as keyof NotificationOptions;
                const propValue = option[propKey];

                // Safely assign property
                if (notification && propValue !== undefined) {
                  // Use explicit type casting instead of any
                  (notification as Record<keyof NotificationOptions, unknown>)[propKey] = propValue;
                }
              }
            });
          }

          return true;
        } else {
          logger.warn(`Notification with ID ${option.notificationId} not found for update`);
          return false;
        }
      }

      return false;
    },

    setPosition(position: NotificationPosition) {
      if (position) {
        defaultOptions.position = position;
      }
    },
  };

  return {
    defaultOptions,
    notificationContainers,
    actions,
    getAllNotifications,
    getNotificationsByPosition,
    appendInstance,
    getNotification,
    generateNotificationId: generateId,
    hasNotification,
  };
}
