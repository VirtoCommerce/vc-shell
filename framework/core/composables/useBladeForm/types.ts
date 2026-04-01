import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import type { useForm } from "vee-validate";

export interface UseBladeFormOptions<T> {
  /** Reactive data object for the form */
  data: Ref<T>;
  /** Additional condition for canSave (e.g., computed(() => !isSkuValidating.value)) */
  canSaveOverride?: ComputedRef<boolean>;
  /**
   * Auto onBeforeClose guard behavior:
   * - true (default): show unsaved changes dialog when isModified
   * - false: no auto guard
   * - ComputedRef<boolean>: custom guard condition (combined with isModified via &&)
   */
  autoBeforeClose?: boolean | ComputedRef<boolean>;
  /** Disable auto useBeforeUnload registration (default: true = enabled) */
  autoBeforeUnload?: boolean;
  /** Custom message for unsaved changes dialog */
  closeConfirmMessage?: MaybeRefOrGetter<string>;
  /**
   * Custom revert handler. Called by revert().
   * If not provided, revert() does data.value = cloneDeep(pristine).
   */
  onRevert?: () => void | Promise<void>;
}

export interface UseBladeFormReturn {
  setBaseline: () => void;
  revert: () => void | Promise<void>;
  canSave: ComputedRef<boolean>;
  isModified: ComputedRef<boolean>;
  isReady: ComputedRef<boolean>;
  formMeta: ReturnType<typeof useForm>["meta"];
  setFieldError: ReturnType<typeof useForm>["setFieldError"];
  errorBag: ReturnType<typeof useForm>["errorBag"];
}

export interface BladeFormInjection {
  isModified: ComputedRef<boolean>;
  canSave: ComputedRef<boolean>;
}
