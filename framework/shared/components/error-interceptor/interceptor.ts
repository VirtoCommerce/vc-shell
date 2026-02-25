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
    const { error, reset } = useErrorHandler(props.capture);

    // Propagate errors to blade.error when used inside a blade context
    const descriptor = inject(BladeDescriptorKey, undefined);
    const bladeStack = inject(BladeStackKey, undefined);

    if (descriptor && bladeStack) {
      watch(error, (newError) => {
        const bladeId = descriptor.value.id;
        if (newError) {
          // Cancel any deferred useAsync toast — blade banner replaces it
          cancelPendingErrorNotification(newError);
          bladeStack.setBladeError(bladeId, newError);
        } else {
          bladeStack.clearBladeError(bladeId);
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
