import { ToRefs, unref, UnwrapRef } from "vue";

export function unrefNested<T extends ToRefs<Record<string, unknown>>>(field: T) {
  const unreffedProps = {} as { [K in keyof T]: UnwrapRef<T[K]> };

  if (field) {
    Object.keys(field).forEach((key: keyof T) => {
      unreffedProps[key] = unref(field[key]) as UnwrapRef<T[typeof key]>;
    });

    return unreffedProps;
  }
  return field;
}
