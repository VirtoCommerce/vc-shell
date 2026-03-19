import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

const mockOpen = vi.fn();

vi.mock("@shared/components/popup-handler/composables/usePopup", () => ({
  usePopup: () => ({
    open: mockOpen,
  }),
}));

vi.mock("../_internal/vc-gallery-preview/vc-gallery-preview.vue", () => ({
  default: { name: "VcGalleryPreview" },
}));

import { useGalleryPreview } from "./useGalleryPreview";

describe("useGalleryPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns openPreview function", () => {
    const images = ref([]);
    const { result } = mountWithSetup(() => useGalleryPreview(images));

    expect(result).toHaveProperty("openPreview");
    expect(typeof result.openPreview).toBe("function");
  });

  it("openPreview calls popup open", () => {
    const images = ref([{ url: "img1.jpg" }, { url: "img2.jpg" }] as any[]);
    const { result } = mountWithSetup(() => useGalleryPreview(images));

    result.openPreview(1);
    expect(mockOpen).toHaveBeenCalledOnce();
  });

  it("openPreview can be called multiple times with different indices", () => {
    const images = ref([{ url: "a.jpg" }, { url: "b.jpg" }, { url: "c.jpg" }] as any[]);
    const { result } = mountWithSetup(() => useGalleryPreview(images));

    result.openPreview(0);
    result.openPreview(2);
    expect(mockOpen).toHaveBeenCalledTimes(2);
  });
});
