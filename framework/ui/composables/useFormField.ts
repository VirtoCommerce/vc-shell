import { computed, inject, useId } from "vue";
import type { IFormFieldProps } from "@ui/types/form-field";
import { InputGroupContextKey } from "@ui/components/molecules/vc-input-group/context";

/**
 * Shared logic for all form field components.
 * Handles: unique ID generation, ARIA attribute computation,
 * InputGroupContext integration, and resolved disabled/invalid state.
 */
export function useFormField(props: IFormFieldProps & { hint?: string }) {
  const groupContext = inject(InputGroupContextKey, null);
  const uid = useId();

  const fieldId = computed(() => `vc-field-${uid}`);
  const labelId = computed(() => `${fieldId.value}-label`);
  const errorId = computed(() => `${fieldId.value}-error`);
  const hintId = computed(() => `${fieldId.value}-hint`);

  const invalid = computed(() => !!props.error || !!props.errorMessage || !!groupContext?.invalid.value);

  const resolvedDisabled = computed(() => !!props.disabled || !!groupContext?.disabled.value);

  const resolvedName = computed(() => groupContext?.name.value || props.name);

  const ariaRequired = computed(() => (props.required ? true : undefined));

  const ariaDescribedBy = computed(() => {
    const ids = new Set<string>();

    if (groupContext?.describedBy.value) {
      groupContext.describedBy.value.split(/\s+/).forEach((id) => ids.add(id));
    }

    if (props.errorMessage) {
      ids.add(errorId.value);
    }

    if (props.hint) {
      ids.add(hintId.value);
    }

    return ids.size ? Array.from(ids).join(" ") : undefined;
  });

  return {
    fieldId,
    labelId,
    errorId,
    hintId,
    invalid,
    resolvedDisabled,
    resolvedName,
    ariaRequired,
    ariaDescribedBy,
    groupContext,
  };
}
