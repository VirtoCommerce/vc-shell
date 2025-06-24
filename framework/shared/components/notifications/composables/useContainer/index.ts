import { createApp, nextTick, reactive, ref, Ref } from "vue";
import { NotificationOptions, NotificationPosition } from "../../types";
import { NotificationContainer } from "../../components";
import { useInstance } from "../useInstance";
import * as _ from "lodash-es";
import { generateId } from "../../../../../core/utilities";

export interface PendingNotification {
  notificationId: string | number;
  notificationProps: NotificationOptions;
  position: NotificationPosition;
}

interface PendingContainer {
  items: PendingNotification[];
}

interface IUseContainer {
  defaultOptions: NotificationOptions;
  pending: PendingContainer;
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

const pending = reactive<PendingContainer>({ items: [] });

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
    limit: 3,
    position: "top-center",
  });

  function getAllNotifications() {
    // Combine notifications from all positions
    return Object.values(notificationContainers).flatMap((container) => container.value);
  }

  function getNotificationsByPosition(position: NotificationPosition) {
    return notificationContainers[position].value;
  }

  function existPendingItem() {
    return pending.items.length > 0;
  }

  function appendFromPending() {
    if (pending.items.length > 0) {
      const append = pending.items.shift();
      if (append?.notificationProps) appendInstance(append?.notificationProps);
    }
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

      // Check the limit for this position
      if (options.limit && containers.value.length >= options.limit) {
        // Add to the waiting queue
        pending.items.push({
          notificationId: options.notificationId || generateId(),
          notificationProps: options,
          position,
        });
        return;
      }

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
          _.remove(notificationContainers[positionToRemoveFrom].value, (item) => item.notificationId === id);

          // If container is empty and there are no pending notifications for this position - remove it
          const hasPendingForPosition = pending.items.some((item) => item.position === positionToRemoveFrom);

          if (notificationContainers[positionToRemoveFrom].value.length === 0 && !hasPendingForPosition) {
            unmountComponent(positionToRemoveFrom);
          }

          // Check pending notifications for this position
          const pendingForPosition = pending.items.find((item) => item.position === positionToRemoveFrom);
          if (pendingForPosition) {
            const index = pending.items.indexOf(pendingForPosition);
            const item = pending.items.splice(index, 1)[0];
            if (item?.notificationProps) {
              appendInstance(item.notificationProps);
            }
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
      pending.items = [];
    },

    dismiss(notificationId: string | number) {
      if (notificationId) {
        // Find the notification among all containers
        let found = false;
        let foundPosition: NotificationPosition | undefined;

        Object.values(notificationContainers).forEach((container) => {
          container.value.forEach((item) => {
            if (item.notificationId === notificationId) {
              found = true;
              foundPosition =
                (item.position as NotificationPosition) || (defaultOptions.position as NotificationPosition);

              // Find the toast element - it has class vc-notification within the notification container
              const nodeId = String(notificationId);
              const node = document.getElementById(nodeId);

              if (node) {
                // Add exit animation class based on position
                const exitClass = `notification-exit-${foundPosition}`;
                node.classList.add(exitClass);

                // Set explicit styles for animation
                node.style.transition = "opacity 300ms ease-out, transform 300ms ease-out";
                node.style.opacity = "0";

                // Apply transform based on position for exit animation
                switch (foundPosition) {
                  case "top-center":
                    node.style.transform = "translateY(-30px)";
                    break;
                  case "top-right":
                    node.style.transform = "translate(30px, -30px)";
                    break;
                  case "top-left":
                    node.style.transform = "translate(-30px, -30px)";
                    break;
                  case "bottom-center":
                    node.style.transform = "translateY(30px)";
                    break;
                  case "bottom-right":
                    node.style.transform = "translate(30px, 30px)";
                    break;
                  case "bottom-left":
                    node.style.transform = "translate(-30px, 30px)";
                    break;
                  default:
                    node.style.transform = "translateY(-30px)";
                }

                // Remove the notification after animation completes
                setTimeout(() => {
                  actions.remove(notificationId);
                }, 300);
              } else {
                // If node not found, remove immediately
                actions.remove(notificationId);
              }
            }
          });
        });
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
          console.log(`Updating notification ${option.notificationId} in position ${containerPosition}`);

          // If the position changes, move the notification between containers
          if (option.position && option.position !== containerPosition) {
            // Remove from current container
            _.remove(containerToUpdate.value, (item) => item.notificationId === option.notificationId);

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
              console.log(`Creating new container for position ${targetPosition}`);
              appendInstance(updatedNotification);
            } else {
              // If a container exists for the target position, add the updated notification
              console.log(`Adding to existing container for position ${targetPosition}`);
              notificationContainers[targetPosition].value.push(updatedNotification);
            }
          } else {
            // Standard update of notification properties
            console.log(`Standard update of notification properties`);

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
          console.warn(`Notification with ID ${option.notificationId} not found for update`);
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
    pending,
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

// Function, defining exit animation for each position
function getExitTransform(position: NotificationPosition): string {
  const distance = "var(--notification-slide-distance)";

  switch (position) {
    case "top-center":
      return `translateY(calc(-1 * ${distance})) scale(0.95)`;
    case "top-right":
      return `translate(${distance}, calc(-1 * ${distance})) scale(0.95)`;
    case "top-left":
      return `translate(calc(-1 * ${distance}), calc(-1 * ${distance})) scale(0.95)`;
    case "bottom-center":
      return `translateY(${distance}) scale(0.95)`;
    case "bottom-right":
      return `translate(${distance}, ${distance}) scale(0.95)`;
    case "bottom-left":
      return `translate(calc(-1 * ${distance}), ${distance}) scale(0.95)`;
    default:
      return "translateY(-20px) scale(0.95)";
  }
}
