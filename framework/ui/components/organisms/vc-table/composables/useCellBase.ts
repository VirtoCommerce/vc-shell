import { computed, type Ref, toRef } from "vue";

/**
 * Common props for all editable cell components
 */
export interface CellBaseProps {
  /** Cell value */
  value?: unknown;
  /** Whether cell is editable */
  editable?: boolean;
  /** Label for the field (used in validation) */
  label?: string;
  /** Field name for validation */
  fieldName?: string;
  /** Field ID for identifying the cell */
  fieldId?: string;
  /** Validation rules */
  rules?: Record<string, unknown>;
  /** Row index for identifying the row */
  rowIndex?: number;
}

/**
 * Common emits for all editable cell components
 */
export interface CellBaseEmits {
  (e: "update", payload: { field: string; value: unknown }): void;
  (e: "blur", payload: { row: number | undefined; field: string }): void;
}

/**
 * Options for useCellBase composable
 */
export interface UseCellBaseOptions<T = unknown> {
  /** Props from the component */
  props: CellBaseProps;
  /** Emit function from the component */
  emit: CellBaseEmits;
  /** Formatter function to format display value */
  formatter?: (value: T) => string;
  /** Check if value is empty (for "Not Set" display) */
  isEmpty?: (value: T) => boolean;
}

/**
 * Base composable for cell components.
 * Provides common logic for editable cells: blur handling, value formatting, empty state.
 *
 * @example
 * ```ts
 * const { onBlur, displayValue, isValueEmpty } = useCellBase({
 *   props,
 *   emit,
 *   formatter: (val) => formatMoney(val, props.currency),
 *   isEmpty: (val) => val == null || val === 0,
 * });
 * ```
 */
export function useCellBase<T = unknown>(options: UseCellBaseOptions<T>) {
  const { props, emit, formatter, isEmpty: isEmptyFn } = options;

  /**
   * Handle blur event from input.
   * Only emits blur if there are no validation errors.
   */
  const onBlur = (errors: string[]) => {
    if (errors && errors.length > 0) return;
    emit("blur", { row: props.rowIndex, field: props.fieldId || "" });
  };

  /**
   * Handle value update from input
   */
  const onUpdate = (newValue: unknown) => {
    emit("update", { field: props.fieldId || "", value: newValue });
  };

  /**
   * Formatted display value
   */
  const displayValue = computed(() => {
    const val = props.value as T;
    if (val == null) return "";
    if (formatter) return formatter(val);
    return String(val);
  });

  /**
   * Whether value is considered empty (for "Not Set" display)
   */
  const isValueEmpty = computed(() => {
    const val = props.value as T;
    if (isEmptyFn) return isEmptyFn(val);
    return val == null;
  });

  /**
   * Common editable wrapper props
   */
  const editableWrapperProps = computed(() => ({
    label: props.label || "",
    fieldName: props.fieldName || "",
    modelValue: props.value,
    rules: props.rules,
  }));

  return {
    onBlur,
    onUpdate,
    displayValue,
    isValueEmpty,
    editableWrapperProps,
  };
}
