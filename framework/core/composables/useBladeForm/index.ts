import { ref, computed, provide, toValue, watch, type Ref } from "vue";
import { useForm } from "vee-validate";
import { cloneDeep } from "lodash-es";
import { useBeforeUnload } from "@core/composables/useBeforeUnload";
import { useBlade } from "@core/composables/useBlade";
import { usePopup } from "@core/composables/usePopup";
import { BladeFormKey } from "@framework/injection-keys";
import type { UseBladeFormOptions, UseBladeFormReturn } from "./types";

export type { UseBladeFormOptions, UseBladeFormReturn, BladeFormInjection } from "./types";

function isEmptyPrimitive(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function semanticEqual(a: unknown, b: unknown): boolean {
  // Both empty primitives
  if (isEmptyPrimitive(a) && isEmptyPrimitive(b)) return true;
  // [] ≈ undefined/null (empty array = empty)
  if (isEmptyPrimitive(a) && Array.isArray(b) && b.length === 0) return true;
  if (Array.isArray(a) && a.length === 0 && isEmptyPrimitive(b)) return true;

  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, i) => semanticEqual(item, b[i]));
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
  for (const key of allKeys) {
    if (!semanticEqual(aObj[key], bObj[key])) return false;
  }
  return true;
}

/**
 * Unified form state management for blades.
 *
 * Encapsulates vee-validate form, modification tracking, browser unload guard,
 * and blade close guard into a single composable with lifecycle-based API.
 *
 * **Must be called from component setup()** — uses provide() internally.
 *
 * Unlike useModificationTracker (which creates a separate currentValue clone),
 * this composable tracks changes directly on the passed `data` ref.
 * The template binds to `data` via v-model — edits go straight into
 * the ref and are detected by a deep watcher against a pristine snapshot.
 */
export function useBladeForm<T>(options: UseBladeFormOptions<T>): UseBladeFormReturn {
  const {
    data,
    canSaveOverride,
    autoBeforeClose = true,
    autoBeforeUnload = true,
    closeConfirmMessage,
    onRevert,
  } = options;

  // --- vee-validate ---
  const { meta: formMeta, setFieldError, errorBag } = useForm({ validateOnMount: false });

  // --- Pristine snapshot tracking ---
  // We track modifications by comparing `data` against a pristine snapshot.
  // Unlike useModificationTracker, there is no separate currentValue clone —
  // the template writes directly into `data`, and the deep watcher detects changes.
  const pristineSnapshot = ref(cloneDeep(data.value)) as Ref<T>;
  const trackerIsModified = ref(false);

  watch(
    data,
    (newVal) => {
      if (isReady.value) {
        trackerIsModified.value = !semanticEqual(newVal, pristineSnapshot.value);
      }
    },
    { deep: true },
  );

  // --- Readiness gate ---
  const isReady = ref(false);

  const isModified = computed(() => isReady.value && trackerIsModified.value);

  const canSave = computed(() => {
    if (!isReady.value) return false;
    if (!formMeta.value.valid) return false;
    if (!trackerIsModified.value) return false;
    if (canSaveOverride && !canSaveOverride.value) return false;
    return true;
  });

  // --- Lifecycle methods ---
  function setBaseline(): void {
    pristineSnapshot.value = cloneDeep(data.value) as T;
    trackerIsModified.value = false;
    isReady.value = true;
  }

  /**
   * Mark the form as ready without resetting the pristine snapshot.
   *
   * Unlike `setBaseline()`, this does NOT overwrite the pristine snapshot.
   * Instead it compares current `data` against the snapshot taken at setup time
   * and sets `trackerIsModified` accordingly.
   *
   * Use when data was programmatically pre-filled (e.g. "create from template")
   * and should appear as modified immediately so the save button is enabled.
   */
  function markReady(): void {
    isReady.value = true;
    trackerIsModified.value = !semanticEqual(data.value, pristineSnapshot.value);
  }

  function revert(): void | Promise<void> {
    if (onRevert) {
      return onRevert();
    }
    data.value = cloneDeep(pristineSnapshot.value);
  }

  // --- Auto guards ---
  if (autoBeforeUnload) {
    useBeforeUnload(isModified);
  }

  if (autoBeforeClose !== false) {
    const { onBeforeClose } = useBlade();
    const { showConfirmation } = usePopup();

    onBeforeClose(async () => {
      let shouldGuard: boolean;

      if (typeof autoBeforeClose === "object") {
        // ComputedRef<boolean> — custom condition AND isModified
        shouldGuard = autoBeforeClose.value && isModified.value;
      } else {
        // true (default) — guard based on isModified only
        shouldGuard = isModified.value;
      }

      if (shouldGuard) {
        const message = closeConfirmMessage
          ? toValue(closeConfirmMessage)
          : "You have unsaved changes. Are you sure you want to leave?";
        return !(await showConfirmation(message));
      }
      return false;
    });
  }

  // --- Provide for VcBlade auto-integration ---
  provide(BladeFormKey, { isModified, canSave });

  return {
    setBaseline,
    markReady,
    revert,
    canSave,
    isModified,
    isReady: computed(() => isReady.value),
    formMeta,
    setFieldError,
    errorBag,
  };
}
