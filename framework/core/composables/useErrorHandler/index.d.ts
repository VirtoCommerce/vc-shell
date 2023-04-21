import { ComponentInternalInstance } from "vue";
export declare function useErrorHandler(element: ComponentInternalInstance): {
  errorStack: import("vue").Ref<any[]>;
  showErrorInBlade: (error: string) => Promise<void>;
  showErrorInToast: () => void;
};
//# sourceMappingURL=index.d.ts.map
