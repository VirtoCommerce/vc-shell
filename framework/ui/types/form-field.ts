/**
 * Base props shared by ALL form field components:
 * VcCheckbox, VcSwitch, VcRadioButton, VcInput, VcTextarea,
 * VcSelect, VcDatePicker, VcEditor, VcFileUpload, VcColorInput, etc.
 */
export interface IFormFieldProps {
  /** Field label text */
  label?: string;
  /** Tooltip text shown on label hover */
  tooltip?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Form field name attribute */
  name?: string;
  /** External error flag */
  error?: boolean;
  /** Error message text — also sets error state when truthy */
  errorMessage?: string;
}

/**
 * Extended props for text-input-like components:
 * VcInput, VcTextarea, VcSelect, VcDatePicker, VcColorInput
 */
export interface ITextFieldProps extends IFormFieldProps {
  /** Placeholder text */
  placeholder?: string;
  /** Hint text shown below the field */
  hint?: string;
  /** Show clear button */
  clearable?: boolean;
  /** Show loading indicator */
  loading?: boolean;
  /** Auto-focus on mount */
  autofocus?: boolean;
  /** Field size variant */
  size?: "default" | "small";
  /** Whether multilanguage mode is active */
  multilanguage?: boolean;
  /** Current language code for multilanguage mode */
  currentLanguage?: string;
}
