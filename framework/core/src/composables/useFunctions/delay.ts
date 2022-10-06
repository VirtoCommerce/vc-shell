export default function delay(
  func: (...args: unknown[]) => void,
  delay = 0
): void {
  console.debug(`[@vc-shell/core#useFunctions:delay] - Entry point`);
  setTimeout(func, delay);
}
