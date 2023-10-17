import { unref } from "vue";

export function unrefNested<T>(field: T) {
  const unreffedProps = {} as T;

  if (field) {
    Object.keys(field).forEach((key) => {
      unreffedProps[key] = unref(field[key]);
    });

    return unreffedProps;
  }
  return field;
}
