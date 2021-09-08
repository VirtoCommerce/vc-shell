export default function debounce(
  func: (...args: unknown[]) => void,
  delay: number
): (...args: unknown[]) => void {
  console.debug(`[@virtoshell/core#useFunctions:debounce] - Entry point`);
  let timer: number | null = null;
  let wasDebounced = false;

  return function (...args: unknown[]): void {
    if (timer) {
      wasDebounced = true;
      clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      timer = null;

      if (wasDebounced) {
        func(...args);
      }

      wasDebounced = false;
    }, delay);
  };
}
