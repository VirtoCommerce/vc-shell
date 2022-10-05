export default function sleep(ms: number): Promise<void> {
  console.debug(`[@virto-shell/core#useFunctions:sleep] - Entry point`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
