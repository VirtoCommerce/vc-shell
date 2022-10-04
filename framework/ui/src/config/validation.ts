import { defineRule, useForm as _useForm } from "vee-validate";
import { email, numeric } from "@vee-validate/rules";

// Define global validation rules
defineRule("required", (value: string | boolean) => {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === ""
  ) {
    return "This field is required";
  }
  return true;
});
defineRule("numeric", numeric);
defineRule("email", email);
defineRule("min", (value: string, [limit]: number[]) => {
  // The field is empty so it should pass
  if (!value || !value.length) {
    return true;
  }
  if (value.length < limit) {
    return `This field must contain at least ${limit} characters`;
  }
  return true;
});
defineRule("max", (value: string, [limit]: number[]) => {
  // The field is empty so it should pass
  if (!value || !value.length) {
    return true;
  }
  if (value.length > limit) {
    return `This field must contain not more than ${limit} characters`;
  }
  return true;
});
defineRule("regex", (value: string, [re]: RegExp[]) => {
  // Field is empty, should pass
  if (!value || !value.length) {
    return true;
  }
  // Check if matched
  if (!re.test(value)) {
    return "This field must match a given pattern";
  }
  return true;
});
defineRule("min_value", (value: string, [min]: number[]) => {
  // The field is empty so it should pass
  if (!value || !value.length) {
    return true;
  }
  const numericValue = Number(value);
  if (numericValue < min) {
    return `Value must be greater than ${min}`;
  }
  return true;
});
defineRule("max_value", (value: string, [max]: number[]) => {
  // The field is empty so it should pass
  if (!value || !value.length) {
    return true;
  }
  const numericValue = Number(value);
  if (numericValue > max) {
    return `Value must be less than ${max}`;
  }
  return true;
});
defineRule("after", (value: string, [target]: string[]) => {
  // The field is empty so it should pass
  if (!value || !value.length) {
    return true;
  }

  const first_date = new Date(value);
  const second_date = new Date(target);

  if (first_date.getTime() > 0 && second_date.getTime() > 0) {
    if (second_date.getTime() > first_date.getTime()) {
      return "End date must be later than start date";
    }
  }

  return true;
});
defineRule(
  "maxdimensions",
  (
    images: HTMLInputElement,
    [width, height]: [string | number, string | number]
  ) => {
    // The field is empty so it should pass
    if (!images?.files || !images.files?.length) {
      return true;
    }

    const validateImage = (
      file: File,
      width: string | number,
      height: string | number
    ) => {
      const URL = window.URL || window.webkitURL;
      return new Promise((resolve) => {
        const image = new Image();
        image.onerror = () => resolve(false);
        image.onload = () => {
          const isValid =
            image.width >= Number(width) && image.height >= Number(height);
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
    return Promise.all(
      list.map((file) => validateImage(file, width, height))
    ).then((res) => {
      const isInvalid = res.find((x) => x !== true);
      if (isInvalid === false || typeof isInvalid === "string") {
        return isInvalid;
      } else {
        return true;
      }
    });
  }
);

defineRule("size", (file: HTMLInputElement, [size]: [number]) => {
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
});

export const useForm = _useForm;
