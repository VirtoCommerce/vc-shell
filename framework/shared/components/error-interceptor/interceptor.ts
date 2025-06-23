import { useErrorHandler } from "./../../../core/composables";
import { defineComponent, VNode } from "vue";

// This is an internal type used within useErrorHandler now.
// We are re-exporting a similar structure for clarity in components that use it.
export type DisplayableError = Error & { details?: string };

export interface Props {
  capture?: boolean;
}

export interface Emits {
  (event: "error", value: DisplayableError): void;
  (event: "reset"): void;
}

export type Slots = {
  slots: {
    default: (args: { error: DisplayableError | null; reset: () => void }) => VNode[];
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
    error(value: Error) {
      return value instanceof Error;
    },
    reset(): boolean {
      return true;
    },
  },
  setup(props, { slots }) {
    const { error, reset } = useErrorHandler(props.capture);

    return () =>
      slots.default?.({
        error: error.value,
        reset,
      });
  },
});
