/* eslint-disable @typescript-eslint/no-explicit-any */
export default function debounce(func: (...args: any[]) => void, delay: number): (...args: unknown[]) => void {
  console.debug(`[@vc-shell/framework#useFunctions:debounce] - Entry point`);
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
