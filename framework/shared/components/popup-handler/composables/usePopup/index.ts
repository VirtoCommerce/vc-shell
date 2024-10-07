/* eslint-disable @typescript-eslint/no-explicit-any */
import { VcPopup } from "./../../../../../ui/components";
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
import { PopupPlugin, UsePopupInternal, UsePopupProps } from "./../../types";
import { popupPluginInstance } from "./../../plugin";
import { useI18n } from "vue-i18n";
import { ComponentPublicInstanceConstructor } from "../../../../utilities/vueUtils";
import * as _ from "lodash-es";
import vcPopupWarning from "../../../common/popup/vc-popup-warning.vue";
import vcPopupError from "../../../common/popup/vc-popup-error.vue";
import vcPopupInfo from "../../../common/popup/vc-popup-info.vue";
interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>): Promise<boolean>;
  showError(message: string | Ref<string>): void;
  showInfo(message: string | Ref<string>): void;
}

function usePopupInternal() {
  const instance = getCurrentInstance();
  const popupInstance: PopupPlugin = (instance && inject("popupPlugin")) || popupPluginInstance;

  return popupInstance;
}

export function usePopup<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
  options?: MaybeRef<UsePopupProps<T>>,
): IUsePopup {
  const { t } = useI18n({ useScope: "global" });
  const popupInstance = usePopupInternal();
  let rawPopup: UsePopupProps<DefineComponent> & UsePopupInternal;

  if (options) {
    rawPopup = createInstance(unref(options));
  }

  watch(
    () => options,
    (newVal) => {
      if (newVal) {
        rawPopup = createInstance(unref(newVal));
      }
    },
    { deep: true },
  );

  function destroy(confirmation: UsePopupProps<DefineComponent>): void {
    const popupInstanceInternal = usePopupInternal();
    const index = popupInstanceInternal?.popups?.findIndex((x) =>
      _.isEqualWith(x, confirmation, (val) => val.component),
    );

    if (index !== -1) popupInstanceInternal?.popups?.splice(index, 1);
  }

  async function open(customInstance?: UsePopupProps<DefineComponent>) {
    let activeInstance;
    await nextTick();
    if (popupInstance) {
      activeInstance = popupInstance;
    }

    destroy(rawPopup || customInstance);

    activeInstance?.popups?.push(rawPopup || customInstance);
  }

  function close(customInstance?: UsePopupProps<DefineComponent>) {
    let activeInstance;
    if (popupInstance) {
      activeInstance = popupInstance;
    }
    const index = activeInstance?.popups.indexOf(rawPopup || customInstance);
    if (index !== undefined && index !== -1) activeInstance?.popups?.splice(index, 1);
  }

  async function showConfirmation(message: string | Ref<string>): Promise<boolean> {
    let resolvePromise: (value: boolean | PromiseLike<boolean>) => void;
    const confirmation = createInstance({
      component: vcPopupWarning,
      props: {
        title: t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.CONFIRMATION"),
      },
      emits: {
        onClose() {
          resolvePromise(false);
          close(confirmation);
        },
        onConfirm() {
          resolvePromise(true);
          close(confirmation);
        },
      },
      slots: {
        default: message,
      },
    });

    destroy(confirmation);

    popupInstance.popups.push(confirmation);

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  function showError(message: string | Ref<string>) {
    const confirmation = createInstance({
      component: vcPopupError,
      props: {
        title: t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.ERROR"),
      },
      emits: {
        onClose() {
          close(confirmation);
        },
      },
      slots: {
        default: message,
      },
    });

    destroy(confirmation);

    popupInstance.popups.push(confirmation);
  }

  function showInfo(message: string | Ref<string>) {
    const confirmation = createInstance({
      component: vcPopupInfo,
      props: {
        title: t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.INFO"),
      },
      emits: {
        onClose() {
          close(confirmation);
        },
      },
      slots: {
        default: message,
      },
    });

    destroy(confirmation);

    popupInstance.popups.push(confirmation);
  }

  function createInstance<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
    options: UsePopupProps<T>,
  ) {
    return (
      options &&
      (reactive({
        ...createComponent(options),
        close: close,
        open: open,
      }) as unknown as UsePopupProps<DefineComponent> & UsePopupInternal)
    );
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
