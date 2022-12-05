export default function sleep(ms: number): Promise<void> {
  console.debug(`[@vc-shell/framework#useFunctions:sleep] - Entry point`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
