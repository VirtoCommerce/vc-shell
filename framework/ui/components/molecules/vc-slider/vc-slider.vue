<template>
  <div class="vc-slider tw-relative">
    <swiper
      class="vc-slider__swiper"
      :class="{
        'vc-slider__swiper_overflow-visible': overflow,
        'vc-slider__swiper_navigation': navigation,
      }"
      :modules="modules"
      :space-between="spaceBetweenSlides"
      :navigation="navigation ? buttonsList : false"
      :slides-per-view="slidesPerView as any"
      :observer="true"
      :observe-parents="true"
    >
      <swiper-slide
        v-for="(slide, i) in slides"
        :key="i"
      >
        <slot :slide="slide"></slot>
      </swiper-slide>
    </swiper>
    <!-- Navigation buttons-->
    <div v-show="navigation">
      <div class="vc-slider__prev tw-left-0">
        <slot name="prevBtn">
          <button class="vc-slider__btn">
            <VcIcon icon="material-keyboard_arrow_left"></VcIcon>
          </button>
        </slot>
      </div>
      <div class="vc-slider__next tw-right-0">
        <slot name="nextBtn">
          <button class="vc-slider__btn">
            <VcIcon icon="material-keyboard_arrow_right"></VcIcon>
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../";
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

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

const modules = [Navigation];

const buttonsList = computed(() => ({
  nextEl: ".vc-slider__next",
  prevEl: ".vc-slider__prev",
}));
</script>

<style lang="scss">
:root {
  --slider-button-background: var(--additional-50);
  --slider-button-border: var(--neutrals-300);
  --slider-button-text: var(--primary-500);
  --slider-button-text-disabled: var(--neutrals-400);
}

.vc-slider {
  &__swiper {
    .swiper-slide {
      @apply tw-w-auto;
    }

    &.vc-slider__swiper_overflow-visible {
      @apply tw-overflow-visible;
    }

    &.vc-slider__swiper_navigation {
      @apply tw-px-10;
    }
  }

  &__next,
  &__prev {
    @apply tw-absolute tw-top-2/4 -tw-translate-y-2/4 tw-z-[2];

    &.swiper-button-disabled .vc-slider__btn {
      @apply tw-text-[var(--slider-button-text-disabled)];
    }
  }

  &__btn {
    @apply tw-bg-[var(--slider-button-background)] tw-border tw-border-solid tw-border-[var(--slider-button-border)];
    @apply tw-box-border tw-rounded tw-flex tw-items-center tw-justify-center;
    @apply tw-text-[var(--slider-button-text)] tw-w-8 tw-h-8;
    @apply tw-transition tw-duration-200;
  }

  &__prev {
  }

  &__next {
  }
}
</style>
