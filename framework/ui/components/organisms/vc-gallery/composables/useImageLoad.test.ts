import { describe, it, expect } from "vitest";
import { ref, nextTick } from "vue";
import { useImageLoad } from "./useImageLoad";

describe("useImageLoad", () => {
  it("starts with isLoaded=false and hasError=false", () => {
    const { isLoaded, hasError } = useImageLoad(ref("https://example.com/img.jpg"));
    expect(isLoaded.value).toBe(false);
    expect(hasError.value).toBe(false);
  });

  it("resets state when src changes", async () => {
    const src = ref("https://example.com/a.jpg");
    const { isLoaded, onLoad } = useImageLoad(src);
    onLoad();
    expect(isLoaded.value).toBe(true);

    src.value = "https://example.com/b.jpg";
    await nextTick();
    expect(isLoaded.value).toBe(false);
  });

  it("sets hasError on error", () => {
    const { hasError, onError } = useImageLoad(ref("https://example.com/broken.jpg"));
    onError();
    expect(hasError.value).toBe(true);
  });

  it("handles undefined src", () => {
    const { isLoaded, hasError } = useImageLoad(ref(undefined));
    expect(isLoaded.value).toBe(false);
    expect(hasError.value).toBe(false);
  });
});
