/**
 * Resolves once every url has loaded or failed, or after `timeoutMs`, whichever comes first.
 * Warms the browser cache so previews appear together with the listing instead of after it.
 */
export function preloadImages(urls: string[], timeoutMs: number): Promise<void> {
  if (!urls.length) return Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const loads = urls.map(
    (url) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = url;
      }),
  );
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  return Promise.race([Promise.all(loads).then(() => undefined), timeout]).finally(() => clearTimeout(timer));
}
