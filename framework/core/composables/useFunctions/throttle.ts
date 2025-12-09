export default function throttle(func: (...args: unknown[]) => void, delay: number): (...args: unknown[]) => void {
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
