export default function throttle(
  func: (...args: unknown[]) => void,
  delay: number
): (...args: unknown[]) => void {
  let wasThrottled = false;

  return function (...args: unknown[]): void {
    if (!wasThrottled) {
      func.apply(this, args);
      wasThrottled = true;
      setTimeout(() => {
        wasThrottled = false;
      }, delay);
    }
  };
}
