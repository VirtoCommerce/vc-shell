import { localize } from "@vee-validate/i18n";
import en from "@vee-validate/i18n/dist/locale/en.json";
import * as veeValidate from "vee-validate";

veeValidate.configure({
  generateMessage: localize({ en }),
});

/** @deprecated Use `useForm` directly from `vee-validate` */
export const useForm = veeValidate.useForm;

export * from "./rules";
