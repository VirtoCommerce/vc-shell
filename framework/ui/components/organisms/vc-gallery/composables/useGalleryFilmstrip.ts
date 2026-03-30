import { ref, Ref, watch, nextTick } from "vue";
import type { Swiper as SwiperType } from "swiper";

interface UseGalleryFilmstripOptions {
  imageCount: Ref<number>;
}

export function useGalleryFilmstrip(options: UseGalleryFilmstripOptions) {
  const isExpanded = ref(false);
  const hasOverflow = ref(true); // Optimistic: render filmstrip first, Swiper init will correct
  const swiperRef = ref<SwiperType>();

  function toggleExpand() {
    isExpanded.value = !isExpanded.value;
  }

  function checkOverflow(swiper: SwiperType) {
    hasOverflow.value = !(swiper.isBeginning && swiper.isEnd);
  }

  function onSwiperInit(swiper: SwiperType) {
    swiperRef.value = swiper;
    checkOverflow(swiper);
  }

  function onSwiperResize(swiper: SwiperType) {
    checkOverflow(swiper);
  }

  // Re-check overflow when image count changes (add/remove)
  watch(options.imageCount, () => {
    if (swiperRef.value) {
      // Swiper exists — update and re-check
      nextTick(() => {
        swiperRef.value!.update();
        checkOverflow(swiperRef.value!);
      });
    } else {
      // Swiper doesn't exist (grid is showing) — reset to optimistic
      // so filmstrip renders again and Swiper can re-evaluate
      hasOverflow.value = true;
    }
  });

  return {
    isExpanded,
    hasOverflow,
    swiperRef,
    toggleExpand,
    checkOverflow,
    onSwiperInit,
    onSwiperResize,
  };
}
