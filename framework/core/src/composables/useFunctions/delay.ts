export default function delay(
  func: (...args: unknown[]) => void,
  delay = 0
): void {
  console.debug(`[@virto-shell/core#useFunctions:delay] - Entry point`);
  setTimeout(func, delay);
}
