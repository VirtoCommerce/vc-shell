export const useTableModifications = () => {
  const colsWithPixels = (_value: number | string | undefined) => {
    let internalValue;
    if (typeof _value === "number") {
      internalValue = `${_value}px`;
    }
    internalValue = _value;

    if (internalValue) {
      return {
        maxWidth: internalValue,
        width: internalValue,
        flex: "0 1 auto",
        minWidth: "60px",
      };
    } else {
      return {
        flex: "1 1 0",
        minWidth: "60px",
      };
    }
  };

  return { colsWithPixels };
};
