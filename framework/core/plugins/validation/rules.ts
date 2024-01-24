import { i18n } from "..";
import { defineRule } from "vee-validate";
import * as AllRules from "@vee-validate/rules";

Object.keys(AllRules).forEach((rule: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defineRule(rule, (AllRules as Record<string, any>)[rule]);
});

/**
 * Check if an image dimension larger than a given size.
 */
export const mindimensions = (images: HTMLInputElement, [width, height]: [string | number, string | number]) => {
  // The field is empty so it should pass
  if (!images?.files || !images.files?.length) {
    return true;
  }

  const validateImage = (file: File, width: string | number, height: string | number) => {
    const URL = window.URL || window.webkitURL;
    return new Promise((resolve) => {
      const image = new Image();
      image.onerror = () => resolve(false);
      image.onload = () => {
        const isValid = image.width >= Number(width) && image.height >= Number(height);
        if (isValid) {
          resolve(true);
        } else {
          resolve(i18n.global.t("messages.min_dimensions.error", { width, height }));
        }
      };

      image.src = URL.createObjectURL(file);
    });
  };
  const list = [];
  const fileList = images.files;
  for (let i = 0; i < fileList.length; i++) {
    if (!/\.(jpg|svg|jpeg|png|bmp|gif)$/i.test(fileList[i].name)) {
      return Promise.resolve(i18n.global.t("messages.min_dimensions.not_image_error"));
    }

    list.push(fileList[i]);
  }
  return Promise.all(list.map((file) => validateImage(file, width, height))).then((res) => {
    const isInvalid = res.find((x) => x !== true);
    if (isInvalid === false || typeof isInvalid === "string") {
      return isInvalid;
    } else {
      return true;
    }
  });
};

defineRule("mindimensions", mindimensions);

/**
 * Check if image not exceeding a given size in kilobytes
 */
export const fileWeight = (file: HTMLInputElement, [size]: [number]) => {
  if (!file?.files || !file.files?.length) {
    return true;
  }

  const maxSize = size * 1000;

  const fileSizeChecker = (file: File) => {
    return file.size > maxSize;
  };

  const list = [];
  for (let i = 0; i < file.files.length; i++) {
    list.push(file.files[i]);
  }

  const checker = list.map((x) => fileSizeChecker(x));

  const isInvalid = checker.find((x) => x === true);
  if (isInvalid) {
    return i18n.global.t("messages.file_weight", { size });
  } else {
    return true;
  }
};

defineRule("fileWeight", fileWeight);

const compare = (
  value: string | Date,
  [target]: string[] | Date[],
  comparer: (first: number, second: number) => boolean,
  errorMessage: string,
): boolean | string => {
  // The field is empty so it should pass
  if (!value || (typeof value == "string" && !value.length)) {
    return true;
  }

  let first_date;
  let second_date;
  if (value instanceof Date) {
    first_date = value;
  }

  if (target instanceof Date) {
    second_date = target;
  }

  if (typeof value === "string") {
    first_date = new Date(value);
  }

  if (typeof target === "string") {
    second_date = new Date(target);
  }

  if (first_date?.getTime && first_date?.getTime() > 0 && second_date?.getTime && second_date?.getTime() > 0) {
    if (comparer(second_date.getTime(), first_date.getTime())) {
      return errorMessage;
    }
  }

  return true;
};

// before
export const before = (value: string, [target]: string[]) =>
  compare(value, [target], (first, second) => first < second, i18n.global.t("messages.before"));
defineRule("before", before);

// after
export const after = (value: string, [target]: string[]) =>
  compare(value, [target], (first, second) => first > second, i18n.global.t("messages.after"));

defineRule("after", after);

export const bigInt = (value: string) => {
  if (Number.isSafeInteger(parseInt(value))) {
    return true;
  } else {
    return i18n.global.t("messages.bigint");
  }
};

defineRule("bigint", bigInt);
