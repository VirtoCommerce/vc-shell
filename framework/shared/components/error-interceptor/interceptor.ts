import { useErrorHandler } from "@core/composables";
import { defineComponent, inject, watch, type VNode } from "vue";
import { BladeDescriptorKey, BladeStackKey } from "@shared/components/blade-navigation/types";
import { cancelPendingErrorNotification } from "@core/utilities/pendingErrorNotifications";

export interface Props {
  capture?: boolean;
}

export interface Emits {
  (event: "error", value: Error | string): void;
  (event: "reset"): void;
}

export type Slots = {
  slots: {
    default: (args: { error: Error | string | null; reset: () => void }) => VNode[];
  };
};

export default defineComponent({
  name: "ErrorInterceptor",
  props: {
    capture: {
      default: false,
      type: Boolean,
    },
  },
  emits: {
    error(value: Error | string) {
      return (value && value instanceof Error) || typeof value === "string";
    },
    reset(): boolean {
      return true;
    },
  },
  setup(props, { slots }) {
    // Inject blade context BEFORE registering onErrorCaptured so we can
    // stop error propagation when inside a blade (prevents duplicate toast
    // from the global error handler).
    const descriptor = inject(BladeDescriptorKey, undefined);
    const bladeStack = inject(BladeStackKey, undefined);
    const hasBlade = !!(descriptor && bladeStack);

    const { error, reset } = useErrorHandler(hasBlade || props.capture);

    if (hasBlade) {
      watch(error, (newError) => {
        const bladeId = descriptor!.value.id;
        if (newError) {
          // Cancel any deferred useAsync toast — blade banner replaces it
          cancelPendingErrorNotification(newError);
          bladeStack!.setBladeError(bladeId, newError);
        } else {
          bladeStack!.clearBladeError(bladeId);
        }
      });
    }

    return () =>
      slots.default?.({
        error: error.value,
        reset,
      });
  },
});
