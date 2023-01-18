<template>
  <div class="vc-slider tw-relative">
    <swiper-component
      :class="[
        'vc-slider__swiper',
        {
          'tw-overflow-visible': overflow,
          'tw-px-[40px]': navigation,
        },
      ]"
      :space-between="spaceBetweenSlides"
      :navigation="buttonsList"
      :slidesPerView="slidesPerView"
      :resizeObserver="true"
    >
      <swiper-slide v-for="(slide, i) in slides" :key="i">
        <slot :slide="slide"></slot>
      </swiper-slide>
    </swiper-component>
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
import { computed } from "vue";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/vue";
import SwiperCore, { Navigation } from "swiper";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
SwiperCore.use([Navigation]);

defineProps({
  slides: {
    type: Array,
    default: () => [],
  },

  navigation: {
    type: Boolean,
    default: false,
  },

  overflow: {
    type: Boolean,
    default: false,
  },

  slidesPerView: {
    type: String,
    default: "auto",
  },

  spaceBetweenSlides: {
    type: Number,
    default: 10,
  },
});

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