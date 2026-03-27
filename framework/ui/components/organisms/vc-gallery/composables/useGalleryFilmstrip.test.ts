import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useGalleryFilmstrip } from "./useGalleryFilmstrip";

describe("useGalleryFilmstrip", () => {
  it("starts collapsed by default", () => {
    const { isExpanded } = useGalleryFilmstrip({ imageCount: ref(5) });
    expect(isExpanded.value).toBe(false);
  });

  it("toggles expanded state", () => {
    const { isExpanded, toggleExpand } = useGalleryFilmstrip({ imageCount: ref(5) });
    toggleExpand();
    expect(isExpanded.value).toBe(true);
    toggleExpand();
    expect(isExpanded.value).toBe(false);
  });

  it("hasOverflow is false when imageCount is 0", () => {
    const { hasOverflow } = useGalleryFilmstrip({ imageCount: ref(0) });
    expect(hasOverflow.value).toBe(false);
  });

  it("exposes swiperRef for template binding", () => {
    const { swiperRef } = useGalleryFilmstrip({ imageCount: ref(5) });
    expect(swiperRef.value).toBeUndefined();
  });

  it("checkOverflow detects overflow when swiper cannot show all slides", () => {
    const { hasOverflow, checkOverflow } = useGalleryFilmstrip({ imageCount: ref(10) });
    const mockSwiper = { isBeginning: true, isEnd: false } as any;
    checkOverflow(mockSwiper);
    expect(hasOverflow.value).toBe(true);
  });

  it("checkOverflow sets false when all slides visible", () => {
    const { hasOverflow, checkOverflow } = useGalleryFilmstrip({ imageCount: ref(3) });
    const mockSwiper = { isBeginning: true, isEnd: true } as any;
    checkOverflow(mockSwiper);
    expect(hasOverflow.value).toBe(false);
  });
});
