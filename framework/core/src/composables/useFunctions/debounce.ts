export default function debounce(
  func: (...args: unknown[]) => void,
  delay: number
): (...args: unknown[]) => void {
  console.debug(`[@virtoshell/core#useFunctions:debounce] - Entry point`);
  let timer: number | null = null;

  return function (...args: unknown[]): void {
    if (timer) {
      clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      timer = null;
      func(...args);
    }, delay);
  };
}
