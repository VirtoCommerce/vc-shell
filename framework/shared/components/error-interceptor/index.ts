import { VNode } from "vue";
import _Interceptor from "@shared/components/error-interceptor/interceptor";
import { DisplayableError } from "@core/utilities/error";

export const ErrorInterceptor = _Interceptor as typeof _Interceptor & {
  new (): {
    $slots: {
      default: (args: { error: DisplayableError | null; reset: () => void }) => VNode[];
    };
  };
};

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    ErrorInterceptor: typeof ErrorInterceptor;
  }
}
