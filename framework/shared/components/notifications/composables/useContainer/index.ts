import { createApp, nextTick, reactive, ref, Ref } from "vue";
import { NotificationOptions } from "../../types";
import { NotificationContainer } from "../../components";
import { useInstance } from "../useInstance";
import * as _ from "lodash-es";
import { generateId } from "../../../../../core/utilities";

interface PendingNotification {
  notificationId: string | number;
  notificationProps: NotificationOptions;
}

interface PendingContainer {
  items: PendingNotification[];
}

interface IUseContainer {
  defaultOptions: NotificationOptions;
  pending: PendingContainer;
  notificationContainer: Ref<NotificationOptions[]>;
  actions: {
    add(options: NotificationOptions): void;
    remove(id: string | number): void;
    clear(): void;
    dismiss(notificationId: string | number): void;
  };
  getAllNotifications(): NotificationOptions[];
  appendInstance(options: NotificationOptions): void;
  generateNotificationId(): string;
  getNotification(notificationId: string): NotificationOptions;
}

const pending = reactive<PendingContainer>({ items: [] });
const notificationContainer: Ref<NotificationOptions[]> = ref([]);

const { clearContainer, unmountComponent, saveInstance } = useInstance();

export function useContainer(): IUseContainer {
  const defaultOptions = reactive<NotificationOptions>({
    timeout: 3000,
    pauseOnHover: true,
    limit: 3,
  });

  function getAllNotifications() {
    return notificationContainer.value;
  }

  function existPendingItem() {
    return pending.items.length > 0;
  }

  function appendFromPending() {
    if (pending.items.length > 0) {
      const append = pending.items.shift();
      appendInstance(append?.notificationProps);
    }
  }

  function getNotification(notificationId: string | number) {
    const notification = getAllNotifications();

    return notification.find((item) => item.notificationId === notificationId);
  }

  function generateRoot() {
    const rootInstance = document.querySelector(".notification");
    const notificationContainer = document.querySelector(".notification__container");
    const existRenderRoot = !!notificationContainer;

    const container = rootInstance || document.createElement("div");
    const renderRoot = document.createElement("div");

    renderRoot.className = "notification__container";
    renderRoot.id = "notification";

    if (!rootInstance) {
      container.className = "notification";
      document.body.appendChild(container);
    }

    if (!existRenderRoot) {
      container.appendChild(renderRoot);
    }

    return renderRoot;
  }

  function appendInstance(options: NotificationOptions) {
    const isExist = (notificationContainer.value || []).length > 0;

    if (!isExist && !document.querySelector(`.notification__container`)) {
      const dom = generateRoot();
      const instance = createApp(NotificationContainer, options as Record<string, unknown>);
      instance.mount(dom);
      saveInstance(instance, dom.id);
    }

    nextTick(() => {
      if (options.updateId) {
        actions.update(options);
      } else {
        actions.add(options);
      }
    });
  }

  const actions = {
    add(options: NotificationOptions) {
      if (!notificationContainer.value.find((item) => item.notificationId === options.notificationId)) {
        nextTick(() => {
          notificationContainer.value?.push(options);
          if (options.onOpen && typeof options?.onOpen === "function") {
            options.onOpen(options.payload);
          }
        });
      }
    },
    remove(id: string | number) {
      if (id) {
        const container = document.querySelector(".notification");
        if (container) {
          let notification = notificationContainer.value.find((item) => item.notificationId === id);
          _.remove(notificationContainer.value, (item) => {
            return item.notificationId === id;
          });

          if (!notificationContainer.value.length && !existPendingItem()) {
            unmountComponent();
          }

          appendFromPending();

          nextTick(() => {
            if (notification?.onClose && typeof notification?.onClose === "function") {
              notification.onClose(notification.payload);
              notification = undefined;
            }
          });
        }
      }
    },
    clear() {
      clearContainer();
    },
    dismiss(notificationId: string | number) {
      if (notificationId) {
        const allNotifications = getAllNotifications();
        allNotifications.forEach((item) => {
          if (item.notificationId === notificationId) {
            const node = document.getElementById(String(notificationId));

            if (node) {
              setTimeout(() => {
                actions.remove(notificationId);
              });
            }
          }
        });
      }
    },
    update(option: NotificationOptions) {
      if (option.updateId) {
        const item = notificationContainer.value?.find((item) => item.notificationId === option.notificationId);
        if (item) {
          for (const name in option) {
            if (name in option) {
              const value = option[name];
              item[name] = value;
            }
          }
        }
      }
    },
  };

  return {
    defaultOptions,
    pending,
    notificationContainer,
    actions,
    getAllNotifications,
    appendInstance,
    getNotification,
    generateNotificationId: generateId,
  };
}
