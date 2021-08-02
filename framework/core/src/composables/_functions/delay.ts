export default function delay(
  func: (...args: unknown[]) => void,
  delay = 0
): void {
  setTimeout(func, delay);
}
