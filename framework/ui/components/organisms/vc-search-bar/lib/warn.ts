import { createLogger } from "@core/utilities";

const logger = createLogger("vc-search-bar");
const warned = new Set<string>();

/** @internal A setup mistake that fails silently: warned in development only, once per key */
export function warnOnce(key: string, message: string): void {
  if (!import.meta.env.DEV || warned.has(key)) return;
  warned.add(key);
  logger.warn(message);
}
