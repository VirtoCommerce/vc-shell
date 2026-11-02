import type { AssetLike } from "@core/composables/useAssetsManager";

/**
 * Thumbnails exist only for files the platform stores. An image linked from another host keeps that
 * absolute URL in `relativeUrl` (a stored one has a path there, sometimes starting with "//"), and
 * guessing a thumbnail URL on that host gets a 404 or an unrelated image.
 */
export function isExternalImage(image: AssetLike | undefined): boolean {
  const relativeUrl = image?.relativeUrl;
  return typeof relativeUrl === "string" && /^[a-z][a-z\d+.-]*:/i.test(relativeUrl);
}
