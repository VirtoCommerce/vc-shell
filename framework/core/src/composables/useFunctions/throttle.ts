export default function throttle(
  func: (...args: unknown[]) => void,
  delay: number
): (...args: unknown[]) => void {
  console.debug(`[@vc-shell/core#useFunctions:throttle] - Entry point`);
  let wasThrottled = false;

  return function (...args: unknown[]): void {
    if (!wasThrottled) {
      func(...args);
      wasThrottled = true;
      setTimeout(() => {
        wasThrottled = false;
      }, delay);
    }
  };
}
