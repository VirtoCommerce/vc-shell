<template>
  <div
    class="vc-slider tw-relative"
    role="region"
    :aria-label="ariaLabel || 'Content carousel'"
  >
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
          <button
            type="button"
            class="vc-slider__btn"
            aria-label="Previous slide"
          >
            <VcIcon
              icon="lucide-chevron-left"
              aria-hidden="true"
            ></VcIcon>
          </button>
        </slot>
      </div>
      <div class="vc-slider__next tw-right-0">
        <slot name="nextBtn">
          <button
            type="button"
            class="vc-slider__btn"
            aria-label="Next slide"
          >
            <VcIcon
              icon="lucide-chevron-right"
              aria-hidden="true"
            ></VcIcon>
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@ui/components";
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
  ariaLabel?: string;
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
  --slider-button-border-radius: 6px;
  --slider-focus-ring-color: rgba(59, 130, 246, 0.3);
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
    @apply tw-box-border tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-outline-none;
    @apply tw-text-[var(--slider-button-text)] tw-w-8 tw-h-8;
    @apply tw-transition tw-duration-200;
    border-radius: var(--slider-button-border-radius);

    &:focus-visible {
      @apply tw-ring-[3px] tw-ring-[color:var(--slider-focus-ring-color)] tw-outline-none;
    }

    &:disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed;
    }
  }

  &__prev {
  }

  &__next {
  }
}
</style>
