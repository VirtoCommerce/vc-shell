import { absoluteUrl } from "@core/utilities/assets";

// `absoluteUrl` throws on a malformed url; a broken asset url must not break rendering.
export function safeAbsoluteUrl(url: string): string {
  try {
    return absoluteUrl(url);
  } catch {
    return url;
  }
}
