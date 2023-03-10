import { defineRule } from "vee-validate";
import AllRules, * as veeValidate from "@vee-validate/rules";

Object.keys(AllRules).forEach((rule) => {
  defineRule(rule, AllRules[rule]);
});

/** @deprecated use `required` from `@vee-validate/rules` */
export const required = veeValidate.required;

/** @deprecated use `min` from `@vee-validate/rules` */
export const min = veeValidate.min;

/** @deprecated use `max` from `@vee-validate/rules` */
export const max = veeValidate.required;

/** @deprecated use `numeric` from `@vee-validate/rules` */
export const numeric = veeValidate.numeric;

/** @deprecated use `email` from `@vee-validate/rules` */
export const email = veeValidate.email;

/** @deprecated use `regex` from `@vee-validate/rules` */
export const regex = veeValidate.regex;

/** @deprecated use `min_value` from `@vee-validate/rules` */
export const min_value = veeValidate.min_value;

/** @deprecated use `max_value` from `@vee-validate/rules` */
export const max_value = veeValidate.max_value;

/** @deprecated use `size` from `@vee-validate/rules` */
export const size = veeValidate.size;

/** @deprecated 'maxdimensions' validation rule is deprecated, use 'dimensions' validation rule instead */
export const maxdimensions = (images: HTMLInputElement, [width, height]: [string | number, string | number]) => {
  console.warn("'maxdimensions' validation rule is deprecated, use 'dimensions' validation rule instead");
  return veeValidate.dimensions(images, [width, height]);
};

defineRule("maxdimensions", maxdimensions);

const compare = (
  value: string,
  [target]: string[],
  comparer: (first: number, second: number) => boolean,
  errorMessage: string
): boolean | string => {
  // The field is empty so it should pass
  if (!value || !value.length) {
    return true;
  }

  const first_date = new Date(value);
  const second_date = new Date(target);

  if (first_date.getTime() > 0 && second_date.getTime() > 0) {
    if (comparer(second_date.getTime(), first_date.getTime())) {
      return errorMessage;
    }
  }

  return true;
};

// before
export const before = (value: string, [target]: string[]) =>
  compare(value, [target], (first, second) => first < second, "End date must be earlier than start date");
defineRule("before", before);

// after
export const after = (value: string, [target]: string[]) =>
  compare(value, [target], (first, second) => first < second, "End date must be later than start date");
defineRule("after", after);
