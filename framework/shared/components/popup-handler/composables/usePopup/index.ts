import { VcPopup } from "./../../../../../ui/components";
import { markRaw, getCurrentInstance, inject, reactive, shallowRef, nextTick, Ref, watch, MaybeRef, unref } from "vue";
import { UsePopupInternal, UsePopupProps } from "./../../types";
import { popupPluginInstance } from "./../../plugin";
import { useI18n } from "vue-i18n";

interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>): Promise<boolean>;
  showError(message: string | Ref<string>): void;
}

export function usePopup<T = InstanceType<typeof VcPopup>["$props"]>(props?: MaybeRef<UsePopupProps<T>>): IUsePopup {
  const { t } = useI18n({ useScope: "global" });
  const instance = getCurrentInstance();
  const popupInstance = (instance && inject("popupPlugin")) || popupPluginInstance;
  let rawPopup = createInstance(unref(props));

  watch(
    () => props,
    (newVal) => {
      rawPopup = createInstance(unref(newVal));
    },
    { deep: true }
  );

  async function open(customInstance?: UsePopupProps<unknown>) {
    let activeInstance;
    await nextTick();
    if (popupInstance) {
      activeInstance = popupInstance;
    }

    activeInstance.popups.push(rawPopup || customInstance);
  }

  function close(customInstance?: UsePopupProps<unknown>) {
    let activeInstance;
    if (popupInstance) {
      activeInstance = popupInstance;
    }
    const index = activeInstance.popups.indexOf(rawPopup || customInstance);
    if (index !== -1) activeInstance.popups.splice(index, 1);
  }

  async function showConfirmation(message: string | Ref<string>): Promise<boolean> {
    let resolvePromise;
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

  function createInstance<T>(props: UsePopupProps<T>) {
    return (
      props &&
      (reactive({
        id: Symbol("usePopup"),
        ...createComponent(props),
        close: close,
        open: open,
      }) as UsePopupProps<unknown> & UsePopupInternal)
    );
  }

  return {
    open,
    close,
    showConfirmation,
    showError,
  };
}

function createComponent<T>(props: UsePopupProps<T>) {
  const slots =
    typeof props.slots === "undefined"
      ? {}
      : Object.fromEntries(
          Object.entries(props.slots).map(([slotName, slotContent]) => {
            if (typeof slotContent === "string") {
              return [slotName, slotContent];
            }
            return [slotName, markRaw(slotContent)];
          })
        );

  return {
    ...props,
    slots,
    component: markRaw(shallowRef(props.component)),
  };
}
