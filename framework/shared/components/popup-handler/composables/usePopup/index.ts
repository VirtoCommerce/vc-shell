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
import { ComponentPublicInstanceConstructor, PopupPlugin, UsePopupInternal, UsePopupProps } from "./../../types";
import { popupPluginInstance } from "./../../plugin";
import { useI18n } from "vue-i18n";

interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>): Promise<boolean>;
  showError(message: string | Ref<string>): void;
}

export function usePopup<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
  options?: MaybeRef<UsePopupProps<T>>
): IUsePopup {
  const { t } = useI18n({ useScope: "global" });
  const instance = getCurrentInstance();
  const popupInstance: PopupPlugin = (instance && inject("popupPlugin")) || popupPluginInstance;
  let rawPopup = createInstance(unref(options));

  watch(
    () => options,
    (newVal) => {
      rawPopup = createInstance(unref(newVal));
    },
    { deep: true }
  );

  async function open(customInstance?: UsePopupProps<DefineComponent>) {
    let activeInstance;
    await nextTick();
    if (popupInstance) {
      activeInstance = popupInstance;
    }

    activeInstance.popups.push(rawPopup || customInstance);
  }

  function close(customInstance?: UsePopupProps<DefineComponent>) {
    let activeInstance;
    if (popupInstance) {
      activeInstance = popupInstance;
    }
    const index = activeInstance.popups.indexOf(rawPopup || customInstance);
    if (index !== -1) activeInstance.popups.splice(index, 1);
  }

  async function showConfirmation(message: string | Ref<string>): Promise<boolean> {
    let resolvePromise: (value: boolean | PromiseLike<boolean>) => void;
    const confirmation = createInstance({
      component: VcPopup,
      props: {
        type: "warning",
        variant: "small",
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

    popupInstance.popups.push(confirmation);

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  function showError(message: string | Ref<string>) {
    const confirmation = createInstance({
      component: VcPopup,
      props: {
        type: "error",
        variant: "small",
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

    popupInstance.popups.push(confirmation);
  }

  function createInstance<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
    options: UsePopupProps<T>
  ) {
    return (
      options &&
      (reactive({
        id: Symbol("usePopup"),
        ...createComponent(options),
        close: close,
        open: open,
      }) as UsePopupProps<DefineComponent> & UsePopupInternal)
    );
  }

  return {
    open,
    close,
    showConfirmation,
    showError,
  };
}

function createComponent<T extends ComponentPublicInstanceConstructor<any> = typeof VcPopup>(
  options: UsePopupProps<T>
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
          })
        );

  return {
    ...options,
    slots,
    component: markRaw(shallowRef(options.component)),
  };
}
