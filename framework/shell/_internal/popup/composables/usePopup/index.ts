/* eslint-disable @typescript-eslint/no-explicit-any */
import { VcPopup } from "@ui/components/organisms/vc-popup";
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
  DefineComponent,
} from "vue";
import { PopupPluginKey } from "@shell/_internal/popup/keys";
import { PopupPlugin, UsePopupInternal, UsePopupProps } from "@shell/_internal/popup/types";
import { popupPluginInstance } from "@shell/_internal/popup/plugin";
import { useI18n } from "vue-i18n";
import { ComponentPublicInstanceConstructor } from "@ui/utilities/vueUtils";
import * as _ from "lodash-es";
import vcPopupWarning from "@shell/_internal/popup/common/vc-popup-warning.vue";
import vcPopupError from "@shell/_internal/popup/common/vc-popup-error.vue";
import vcPopupInfo from "@shell/_internal/popup/common/vc-popup-info.vue";
interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>): Promise<boolean>;
  showError(message: string | Ref<string>): void;
  showInfo(message: string | Ref<string>): void;
}

function usePopupInternal() {
  const instance = getCurrentInstance();
  const popupInstance: PopupPlugin = (instance && inject(PopupPluginKey, undefined)) || popupPluginInstance;

  return popupInstance;
}

export function usePopup<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
  options?: MaybeRef<UsePopupProps<T>>,
): IUsePopup {
  const { t } = useI18n({ useScope: "global" });
  const popupInstance = usePopupInternal();
  let rawPopup: (UsePopupProps<DefineComponent> & UsePopupInternal) | undefined;

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

  function destroy(confirmation?: Partial<UsePopupProps<DefineComponent> & UsePopupInternal>): void {
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

  function resolveInstance(customInstance?: UsePopupProps<DefineComponent>): UsePopupProps<DefineComponent> | undefined {
    return rawPopup ?? customInstance;
  }

  function pushInstance(popup?: UsePopupProps<DefineComponent>) {
    if (!popup) {
      return;
    }

    destroy(popup);
    popupInstance?.popups?.push(popup);
  }

  async function open(customInstance?: UsePopupProps<DefineComponent>) {
    await nextTick();
    pushInstance(resolveInstance(customInstance));
  }

  function close(customInstance?: UsePopupProps<DefineComponent>) {
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
    component: ComponentPublicInstanceConstructor<any>,
    title: string,
    message: string | Ref<string>,
  ): UsePopupProps<DefineComponent> & UsePopupInternal {
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
    return new Promise((resolve) => {
      const confirmation = createInstance({
        component: vcPopupWarning,
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
    showSimplePopup(vcPopupError, t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.ERROR"), message);
  }

  function showInfo(message: string | Ref<string>) {
    showSimplePopup(vcPopupInfo, t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.INFO"), message);
  }

  function createInstance<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
    options: UsePopupProps<T>,
  ) {
    const popup = reactive({
      ...createComponent(options),
      id: Symbol("vc-popup-instance"),
      close: () => undefined,
      open: () => undefined,
    }) as unknown as UsePopupProps<DefineComponent> & UsePopupInternal;

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

function createComponent<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
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
