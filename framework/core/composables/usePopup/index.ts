import {
  markRaw,
  getCurrentInstance,
  inject,
  reactive,
  shallowRef,
  nextTick,
  Ref,
  watch,
  MaybeRef,
  unref,
  Component,
} from "vue";
import { PopupPluginKey } from "@core/composables/usePopup/keys";
import type { PopupPlugin, UsePopupInternal, UsePopupProps } from "@core/composables/usePopup/types";
import { popupPluginInstance } from "@core/composables/usePopup/singleton";
import { getPopupPreset } from "@core/composables/usePopup/preset-registry";
import { useI18n } from "vue-i18n";
import * as _ from "lodash-es";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-popup");

interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>): Promise<boolean>;
  showError(message: string | Ref<string>): void;
  showInfo(message: string | Ref<string>): void;
}

function usePopupInternal() {
  const instance = getCurrentInstance();
  const popupInstance: PopupPlugin | undefined =
    (instance && inject(PopupPluginKey, undefined)) || popupPluginInstance;

  return popupInstance;
}

export function usePopup<T extends Component = Component>(
  options?: MaybeRef<UsePopupProps<T>>,
): IUsePopup {
  const { t } = useI18n({ useScope: "global" });
  const popupInstance = usePopupInternal();
  let rawPopup: (UsePopupProps & UsePopupInternal) | undefined;

  if (options) {
    rawPopup = createInstance(unref(options));
  }

  watch(
    () => (options ? unref(options) : undefined),
    (newVal) => {
      if (newVal) {
        rawPopup = createInstance(newVal);
      }
    },
    { deep: true },
  );

  function destroy(confirmation?: Partial<UsePopupProps & UsePopupInternal>): void {
    if (!confirmation) {
      return;
    }

    const popupInstanceInternal = usePopupInternal();
    const index = popupInstanceInternal?.popups?.findIndex((x) =>
      _.isEqualWith(x, confirmation, (val) => val.component),
    );

    if (typeof index === "number" && index !== -1) {
      popupInstanceInternal?.popups?.splice(index, 1);
    }
  }

  function resolveInstance(
    customInstance?: UsePopupProps,
  ): UsePopupProps | undefined {
    return rawPopup ?? customInstance;
  }

  function pushInstance(popup?: UsePopupProps) {
    if (!popup) {
      return;
    }

    destroy(popup);
    popupInstance?.popups?.push(popup);
  }

  async function open(customInstance?: UsePopupProps) {
    await nextTick();
    pushInstance(resolveInstance(customInstance));
  }

  function close(customInstance?: UsePopupProps) {
    const instanceToClose = resolveInstance(customInstance);
    if (!instanceToClose) {
      return;
    }

    const index = popupInstance?.popups.indexOf(instanceToClose);
    if (typeof index === "number" && index !== -1) {
      popupInstance?.popups?.splice(index, 1);
    }
  }

  function showSimplePopup(
    component: Component,
    title: string,
    message: string | Ref<string>,
  ): UsePopupProps & UsePopupInternal {
    const popup = createInstance({
      component,
      props: {
        title,
      },
      emits: {
        onClose() {
          close(popup);
        },
      },
      slots: {
        default: message,
      },
    });

    pushInstance(popup);
    return popup;
  }

  function showConfirmation(message: string | Ref<string>): Promise<boolean> {
    const warningComponent = getPopupPreset("warning");
    if (!warningComponent) {
      logger.error("Popup preset 'warning' not registered. Ensure shell popup plugin is installed.");
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const confirmation = createInstance({
        component: warningComponent,
        props: {
          title: t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.CONFIRMATION"),
        },
        emits: {
          onClose() {
            resolve(false);
            close(confirmation);
          },
          onConfirm() {
            resolve(true);
            close(confirmation);
          },
        },
        slots: {
          default: message,
        },
      });

      pushInstance(confirmation);
    });
  }

  function showError(message: string | Ref<string>) {
    const errorComponent = getPopupPreset("error");
    if (!errorComponent) {
      logger.error("Popup preset 'error' not registered. Ensure shell popup plugin is installed.");
      return;
    }
    showSimplePopup(errorComponent, t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.ERROR"), message);
  }

  function showInfo(message: string | Ref<string>) {
    const infoComponent = getPopupPreset("info");
    if (!infoComponent) {
      logger.error("Popup preset 'info' not registered. Ensure shell popup plugin is installed.");
      return;
    }
    showSimplePopup(infoComponent, t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.INFO"), message);
  }

  function createInstance<T extends Component = Component>(
    options: UsePopupProps<T>,
  ) {
    const popup = reactive({
      ...createComponent(options),
      id: Symbol("vc-popup-instance"),
      close: () => undefined,
      open: () => undefined,
    }) as unknown as UsePopupProps & UsePopupInternal;

    popup.close = () => close(popup);
    popup.open = () => open(popup);

    return popup;
  }

  return {
    open,
    close,
    showConfirmation,
    showError,
    showInfo,
  };
}

function createComponent<T extends Component = Component>(
  options: UsePopupProps<T>,
) {
  const slots =
    typeof options.slots === "undefined"
      ? {}
      : Object.fromEntries(
          Object.entries(options.slots).map(([slotName, slotContent]) => {
            if (typeof slotContent === "string") {
              return [slotName, slotContent];
            }
            return [slotName, markRaw(slotContent)];
          }),
        );

  return {
    ...options,
    slots,
    component: markRaw(shallowRef(options.component)),
  };
}
