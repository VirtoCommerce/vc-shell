export default function delay(
  func: (...args: unknown[]) => void,
  delay = 0
): void {
  console.debug(`[@virtoshell/core#useFunctions:delay] - Entry point`);
  setTimeout(func, delay);
}
