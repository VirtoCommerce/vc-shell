import { defineRule } from "vee-validate";
import AllRules from "@vee-validate/rules";

Object.keys(AllRules).forEach((rule) => {
  defineRule(rule, AllRules[rule]);
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
          resolve(`Image dimensions must be greater than ${height}*${width}`);
        }
      };

      image.src = URL.createObjectURL(file);
    });
  };
  const list = [];
  const fileList = images.files;
  for (let i = 0; i < fileList.length; i++) {
    if (!/\.(jpg|svg|jpeg|png|bmp|gif)$/i.test(fileList[i].name)) {
      return Promise.resolve("Not image file");
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
    return `File size must be maximum ${size} kb`;
  } else {
    return true;
  }
};

defineRule("fileWeight", fileWeight);

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

export const bigInt = (value: string) => {
  if (Number.isSafeInteger(parseInt(value))) {
    return true;
  } else {
    return "Unsupported number";
  }
};

defineRule("bigint", bigInt);
