import { App, Ref, ref } from "vue";
import { NotificationPosition } from "../../types";
import { createLogger } from "../../../../../core/utilities";

const logger = createLogger("notification-instance");

interface IUseInstance {
  saveInstance(app: App<Element>, id: string, position: NotificationPosition): void;
  unmountComponent(position?: NotificationPosition): void;
  clearContainer(): void;
  getInstanceByPosition(position: NotificationPosition): App<Element> | undefined;
}

// Instance storage for different positions
const containerInstances: Record<NotificationPosition, App<Element> | undefined> = {
  "top-center": undefined,
  "top-right": undefined,
  "top-left": undefined,
  "bottom-center": undefined,
  "bottom-right": undefined,
  "bottom-left": undefined,
};

export function useInstance(): IUseInstance {
  function saveInstance(app: App<Element>, id: string, position: NotificationPosition) {
    const container = document.getElementById(id);
    if (container) {
      containerInstances[position] = app;
    }
  }

  function unmountComponent(position?: NotificationPosition) {
    try {
      if (position) {
        // Remove specific container by position
        if (containerInstances[position]) {
          containerInstances[position]?.unmount();
          document.getElementById(`notification-${position}`)?.remove();
          containerInstances[position] = undefined;
        }
      } else {
        // Remove all containers
        Object.keys(containerInstances).forEach((pos) => {
          const position = pos as NotificationPosition;
          containerInstances[position]?.unmount();
          document.getElementById(`notification-${position}`)?.remove();
          containerInstances[position] = undefined;
        });

        // Remove the root container if there are no active containers
        const hasActiveContainers = Object.values(containerInstances).some((instance) => instance !== undefined);
        if (!hasActiveContainers) {
          document.querySelector(".notification")?.remove();
        }
      }
    } catch (error) {
      logger.error("Failed to unmount notification component:", error);
    }
  }

  function clearContainer() {
    Object.keys(containerInstances).forEach((pos) => {
      if (containerInstances[pos as NotificationPosition]) {
        unmountComponent(pos as NotificationPosition);
      }
    });
  }

  function getInstanceByPosition(position: NotificationPosition): App<Element> | undefined {
    return containerInstances[position];
  }

  return {
    saveInstance,
    unmountComponent,
    clearContainer,
    getInstanceByPosition,
  };
}
