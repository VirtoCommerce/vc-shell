import { ref, Ref } from "vue";
import type { Swiper as SwiperType } from "swiper";

interface UseGalleryFilmstripOptions {
  imageCount: Ref<number>;
}

export function useGalleryFilmstrip(options: UseGalleryFilmstripOptions) {
  const isExpanded = ref(false);
  const hasOverflow = ref(false);
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
