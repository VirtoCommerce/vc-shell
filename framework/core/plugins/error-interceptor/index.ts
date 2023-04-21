import { VNode } from "vue";
import _Interceptor from "./interceptor";

export const ErrorInterceptor = _Interceptor as typeof _Interceptor & {
  new (): {
    $slots: {
      default: (args: { error: Error; reset: () => void }) => VNode[];
    };
  };
};

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    ErrorInterceptor: typeof ErrorInterceptor;
  }
}
