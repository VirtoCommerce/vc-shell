<template>
  <div class="vc-slider tw-relative">
    <swiper
      :class="[
        'vc-slider__swiper',
        {
          'tw-overflow-visible': overflow,
          'tw-px-[40px]': navigation,
        },
      ]"
      :space-between="spaceBetweenSlides"
      :navigation="buttonsList as any"
      :slides-per-view="slidesPerView as any"
      :resize-observer="true"
    >
      <swiper-slide
        v-for="(slide, i) in slides"
        :key="i"
        :swiper-ref="SwiperCore"
      >
        <slot :slide="slide"></slot>
      </swiper-slide>
    </swiper>
    <!-- Navigation buttons-->
    <div v-show="navigation">
      <div class="vc-slider__prev tw-left-0">
        <slot name="prevBtn">
          <div class="vc-slider__btn">
            <VcIcon icon="fas fa-chevron-left"></VcIcon>
          </div>
        </slot>
      </div>
      <div class="vc-slider__next tw-right-0">
        <slot name="nextBtn">
          <div class="vc-slider__btn">
            <VcIcon icon="fas fa-chevron-right"></VcIcon>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../";
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore, { Navigation } from "swiper";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";

export interface Props {
  slides?: Record<string, unknown>[] | unknown[];
  navigation?: boolean;
  overflow?: boolean;
  slidesPerView?: string | "auto";
  spaceBetweenSlides?: number;
}

withDefaults(defineProps<Props>(), {
  slides: () => [],
  slidesPerView: "auto",
  spaceBetweenSlides: 10,
});

SwiperCore.use([Navigation]);

const buttonsList = computed(() => ({
  nextEl: ".vc-slider__next",
  prevEl: ".vc-slider__prev",
}));
</script>

<style lang="scss" scoped>
.vc-slider {
  &__swiper {
    .swiper-slide {
      @apply tw-w-auto;
    }
  }

  &__next,
  &__prev {
    @apply tw-absolute tw-top-2/4 -tw-translate-y-2/4 tw-z-[2];

    &.swiper-button-disabled .vc-slider__btn {
      @apply tw-text-[#999999];
    }
  }

  &__btn {
    @apply tw-bg-white tw-border tw-border-solid tw-border-[#eaecf2]
      tw-box-border tw-rounded-[3px]
      tw-flex tw-items-center tw-justify-center
      tw-text-[#43b0e6] tw-w-[30px] tw-h-[30px];
  }
}
</style>
