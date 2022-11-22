<template>
  <div class="vc-slider relative">
    <swiper-component
      :class="[
        'vc-slider__swiper',
        {
          'overflow-visible': overflow,
          'px-[40px]': navigation,
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
      <div class="vc-slider__prev left-0">
        <slot name="prevBtn">
          <div class="vc-slider__btn">
            <VcIcon icon="fas fa-chevron-left"></VcIcon>
          </div>
        </slot>
      </div>
      <div class="vc-slider__next right-0">
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
      @apply w-auto;
    }
  }

  &__next,
  &__prev {
    @apply absolute top-2/4 -translate-y-2/4 z-[2];

    &.swiper-button-disabled .vc-slider__btn {
      @apply text-[#999999];
    }
  }

  &__btn {
    @apply bg-white border border-solid border-[#eaecf2]
      box-border rounded-[3px]
      flex items-center justify-center
      text-[#43b0e6] w-[30px] h-[30px];
  }
}
</style>
