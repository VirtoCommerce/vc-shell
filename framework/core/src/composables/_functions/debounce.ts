export default function debounce(
  func: (...args: unknown[]) => void,
  delay: number
): (...args: unknown[]) => void {
  let timer = null;
  let wasDebounced = false;

  return function (...args: unknown[]): void {
    if (timer) {
      wasDebounced = true;
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;

      if (wasDebounced) {
        func.apply(this, args);
      }

      wasDebounced = false;
    }, delay);
  };
}
