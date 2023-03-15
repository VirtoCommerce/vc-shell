import { VNode } from "vue";
import { ExtractTypes } from "../../../types/ts-helpers";
import { isString, isNumber, isDate } from "../../../utils";

export const editorProps = {
  placeholder: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number, Date],
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: Boolean,
  label: String,
  tooltip: String,
  name: {
    type: String,
    default: "Field",
  },
  errorMessage: String,
};

export const editorEmits = {
  "update:modelValue": (value: string | number | Date) => isString(value) || isNumber(value) || isDate(value),
};

export type VcCodeEditorProps = ExtractTypes<typeof editorProps>;
export type VcCodeEditorEmits = typeof editorEmits;

export interface VcCodeEditorSlots {
  error: () => VNode[];
}
