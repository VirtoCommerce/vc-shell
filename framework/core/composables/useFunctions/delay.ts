export default function delay(
  func: (...args: unknown[]) => void,
  delay = 0
): void {
  console.debug(`[@vc-shell/framework#useFunctions:delay] - Entry point`);
  setTimeout(func, delay);
}
