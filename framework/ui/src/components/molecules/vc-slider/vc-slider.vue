<template>
  <div class="vc-slider">
    <swiper-component
      :class="[
        'vc-slider__swiper',
        {
          'vc-slider__swiper_overflow': overflow,
          'vc-slider__swiper_navigation': navigation,
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
      <div class="vc-slider__prev">
        <slot name="prevBtn">
          <div class="vc-slider__btn">
            <vc-icon icon="fas fa-chevron-left"></vc-icon>
          </div>
        </slot>
      </div>
      <div class="vc-slider__next">
        <slot name="nextBtn">
          <div class="vc-slider__btn">
            <vc-icon icon="fas fa-chevron-right"></vc-icon>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "VcSlider",
});
</script>

<script lang="ts" setup>
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

<style lang="less" scoped>
.vc-slider {
  position: relative;
  &__swiper {
    &_overflow {
      overflow: visible;
    }

    &_navigation {
      padding: 0 40px;
    }

    .swiper-slide {
      width: auto;
    }
  }

  &__next,
  &__prev {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;

    &.swiper-button-disabled .vc-slider__btn {
      color: #999999;
    }
  }

  &__next {
    right: 0;
  }

  &__prev {
    left: 0;
  }

  &__btn {
    background: #ffffff;
    border: 1px solid #eaecf2;
    box-sizing: border-box;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #43b0e6;
    width: 30px;
    height: 30px;
  }
}
</style>
