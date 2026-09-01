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
  h,
} from "vue";
import { PopupPluginKey } from "@core/composables/usePopup/keys";
import type { PopupPlugin, UsePopupInternal, UsePopupProps } from "@core/composables/usePopup/types";
import { popupPluginInstance } from "@core/composables/usePopup/singleton";
import { getPopupPreset } from "@core/composables/usePopup/preset-registry";
import { useI18n } from "vue-i18n";
import { createLogger, focusFallbackTarget, focusIfLoose } from "@core/utilities";

const logger = createLogger("use-popup");

/**
 * How long to wait for a closing popup to report its finished leave transition
 * before unmounting it regardless. Comfortably above the 150ms transition in
 * `vc-popup`, and only reached by popup components that render no transition.
 */
const CLOSE_TRANSITION_FALLBACK_MS = 400;

export interface PopupMessageOptions {
  /**
   * Render the message as HTML instead of text. Off by default: messages are
   * built by interpolating server data into a translation, and as markup an
   * entity name can restyle or add links to a dialog the user is meant to
   * trust. Opt in only for markup you author yourself.
   */
  html?: boolean;
}

interface IUsePopup {
  open(): void;
  close(): void;
  showConfirmation(message: string | Ref<string>, options?: PopupMessageOptions): Promise<boolean>;
  showError(message: string | Ref<string>, options?: PopupMessageOptions): void;
  showInfo(message: string | Ref<string>, options?: PopupMessageOptions): void;
}

/**
 * The popup container renders string slots through `v-html` and everything else
 * through `<component :is>`. Returning a render function therefore routes the
 * message down the escaping branch, keeping reactivity for `Ref` messages.
 */
function toMessageSlot(message: string | Ref<string>, options?: PopupMessageOptions) {
  if (options?.html) return message;
  return () => h("div", { class: "tw-h-full tw-w-full" }, unref(message));
}

function usePopupInternal() {
  const instance = getCurrentInstance();
  const popupInstance: PopupPlugin | undefined = (instance && inject(PopupPluginKey, undefined)) || popupPluginInstance;

  return popupInstance;
}

export function usePopup<T extends Component = Component>(options?: MaybeRef<UsePopupProps<T>>): IUsePopup {
  const { t } = useI18n({ useScope: "global" });
  const popupInstance = usePopupInternal();
  const closeFallbackTimers = new WeakMap<object, ReturnType<typeof setTimeout>>();
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

    const popupInstanceInternal = popupInstance;
    // Match by the unique instance id, not structural equality: each popup carries
    // its own Symbol, so reference-by-id is the correct — and only safe — comparison
    // when several popups are stacked.
    const index = popupInstanceInternal?.popups?.findIndex((x) => x.id === confirmation.id);

    if (typeof index === "number" && index !== -1) {
      popupInstanceInternal?.popups?.splice(index, 1);
    }
  }

  function resolveInstance(customInstance?: UsePopupProps): UsePopupProps | undefined {
    return rawPopup ?? customInstance;
  }

  function pushInstance(popup?: UsePopupProps & Partial<UsePopupInternal>) {
    if (!popup) {
      return;
    }

    const alreadyMounted = popupInstance?.popups.some((instance) => instance.id === popup.id);

    // Every path into the stack goes through here — `open()`, `showConfirmation()`,
    // `showError()`, `showInfo()` — so this is the one place that reliably sees the
    // control the user activated, before the popup takes focus.
    if (!alreadyMounted) {
      const opener = document.activeElement;
      popup.opener = opener instanceof HTMLElement && opener !== document.body ? markRaw(opener) : undefined;
    }

    cancelCloseFallback(popup);
    popup.closing = false;

    destroy(popup);
    popupInstance?.popups?.push(popup);
  }

  async function open(customInstance?: UsePopupProps) {
    await nextTick();
    pushInstance(resolveInstance(customInstance));
  }

  function removeInstance(instance: UsePopupProps & Partial<UsePopupInternal>) {
    cancelCloseFallback(instance);
    const index = popupInstance?.popups.indexOf(instance);
    if (typeof index === "number" && index !== -1) {
      popupInstance?.popups?.splice(index, 1);
      restoreFocusTo(instance.opener);
    }
    instance.opener = undefined;
  }

  function cancelCloseFallback(instance: UsePopupProps & Partial<UsePopupInternal>) {
    const timer = closeFallbackTimers.get(instance);
    if (timer !== undefined) {
      clearTimeout(timer);
      closeFallbackTimers.delete(instance);
    }
  }

  /**
   * Returns focus to the control that opened the popup (WCAG 2.4.3 Focus Order).
   *
   * Headless UI has its own RestoreFocus, but it does not fire here: visibility is
   * driven by the surrounding `TransitionRoot`, so its `Dialog` is permanently
   * "open" and never runs the close path that would restore focus. Removing the
   * subtree therefore drops focus on `<body>`.
   *
   * Two cases leave no opener to return to: one was never captured (the popup was
   * opened while focus was already loose), or it was detached while the popup was
   * open (its blade closed underneath it). Both used to end silently on `<body>`;
   * both now fall back to the workspace.
   */
  function restoreFocusTo(opener?: HTMLElement) {
    focusIfLoose(() => (opener?.isConnected ? opener : focusFallbackTarget()));
  }

  /**
   * Closes in two phases: mark the instance as closing, let the popup play its
   * leave transition, and only then unmount it.
   *
   * Unmounting straight away — which is what this used to do — tore the dialog out
   * of the DOM before it could run its own close sequence, so Headless UI never
   * restored focus to the element that opened the popup and the leave animation
   * never played (VCST-5632). The popup reports the end of its transition through
   * `PopupInstanceKey.finalize`; the timer is the fallback for popup components
   * that render no transition at all.
   */
  function close(customInstance?: UsePopupProps) {
    const instanceToClose = resolveInstance(customInstance) as (UsePopupProps & UsePopupInternal) | undefined;
    if (!instanceToClose) {
      return;
    }

    const index = popupInstance?.popups.indexOf(instanceToClose);
    if (typeof index !== "number" || index === -1 || instanceToClose.closing) {
      return;
    }

    instanceToClose.closing = true;
    const timer = setTimeout(() => {
      if (closeFallbackTimers.get(instanceToClose) !== timer) return;
      closeFallbackTimers.delete(instanceToClose);
      removeInstance(instanceToClose);
    }, CLOSE_TRANSITION_FALLBACK_MS);
    closeFallbackTimers.set(instanceToClose, timer);
  }

  function showSimplePopup(
    component: Component,
    title: string,
    message: string | Ref<string>,
    options?: PopupMessageOptions,
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
        default: toMessageSlot(message, options),
      },
    });

    pushInstance(popup);
    return popup;
  }

  function showConfirmation(message: string | Ref<string>, options?: PopupMessageOptions): Promise<boolean> {
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
          default: toMessageSlot(message, options),
        },
      });

      pushInstance(confirmation);
    });
  }

  function showError(message: string | Ref<string>, options?: PopupMessageOptions) {
    const errorComponent = getPopupPreset("error");
    if (!errorComponent) {
      logger.error("Popup preset 'error' not registered. Ensure shell popup plugin is installed.");
      return;
    }
    showSimplePopup(errorComponent, t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.ERROR"), message, options);
  }

  function showInfo(message: string | Ref<string>, options?: PopupMessageOptions) {
    const infoComponent = getPopupPreset("info");
    if (!infoComponent) {
      logger.error("Popup preset 'info' not registered. Ensure shell popup plugin is installed.");
      return;
    }
    showSimplePopup(infoComponent, t("COMPONENTS.ORGANISMS.VC_POPUP.TITLE.INFO"), message, options);
  }

  function createInstance<T extends Component = Component>(options: UsePopupProps<T>) {
    const popup = reactive({
      ...createComponent(options),
      id: Symbol("vc-popup-instance"),
      close: () => undefined,
      open: () => undefined,
      finalize: () => undefined,
      closing: false,
    }) as unknown as UsePopupProps & UsePopupInternal;

    popup.close = () => close(popup);
    popup.open = () => open(popup);
    popup.finalize = () => {
      if (popup.closing) removeInstance(popup);
    };

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

function createComponent<T extends Component = Component>(options: UsePopupProps<T>) {
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
