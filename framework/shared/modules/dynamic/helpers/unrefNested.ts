import { unref } from "vue";

export function unrefNested<T extends Record<string, unknown>>(field: T) {
  const unreffedProps = {} as T;

  if (field) {
    Object.keys(field).forEach((key: keyof T) => {
      unreffedProps[key] = unref(field[key]);
    });

    return unreffedProps;
  }
  return field;
}
