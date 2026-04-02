<template>
  <div class="vc-gallery-filmstrip">
    <Swiper
      :modules="swiperModules"
      :slides-per-view="'auto'"
      :space-between="gap"
      :navigation="false"
      :mousewheel="{ forceToAxis: true }"
      :free-mode="{ enabled: true, sticky: false }"
      :slides-per-group="1"
      class="vc-gallery-filmstrip__swiper"
      @swiper="onSwiperInit"
      @resize="onSwiperResize"
      @slides-updated="onSlidesUpdated"
    >
      <SwiperSlide
        v-for="(image, i) in images"
        :key="`img_${image.id || i}`"
        class="vc-gallery-filmstrip__slide"
      >
        <div class="vc-gallery__item">
          <slot
            name="item"
            :image="image"
            :index="i"
          />
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Navigation arrows -->
    <button
      v-show="hasOverflow && !loading"
      ref="prevRef"
      type="button"
      class="vc-gallery-filmstrip__nav vc-gallery-filmstrip__nav--prev"
    >
      <VcIcon
        icon="lucide-chevron-left"
        size="xs"
      />
    </button>
    <button
      v-show="hasOverflow && !loading"
      ref="nextRef"
      type="button"
      class="vc-gallery-filmstrip__nav vc-gallery-filmstrip__nav--next"
    >
      <VcIcon
        icon="lucide-chevron-right"
        size="xs"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRef, nextTick } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Mousewheel, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import type { AssetLike } from "@core/composables/useAssetsManager";

export interface Props {
  images: AssetLike[];
  gap?: number;
  hasOverflow: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 8,
  loading: false,
});

const emit = defineEmits<{
  (e: "swiper-init", swiper: SwiperType): void;
  (e: "swiper-resize", swiper: SwiperType): void;
  (e: "slides-updated", swiper: SwiperType): void;
  (e: "sortable-container", el: HTMLElement | undefined): void;
}>();

const swiperModules = [Navigation, Mousewheel, FreeMode];

const prevRef = ref<HTMLButtonElement>();
const nextRef = ref<HTMLButtonElement>();

function onSwiperInit(swiper: SwiperType) {
  swiperInstance.value = swiper;

  // Bind navigation to scoped refs (not global selectors)
  if (prevRef.value && nextRef.value) {
    swiper.params.navigation = {
      ...(swiper.params.navigation as object),
      prevEl: prevRef.value,
      nextEl: nextRef.value,
    };
    swiper.navigation.init();
    swiper.navigation.update();
  }

  emit("swiper-init", swiper);
  emit("sortable-container", swiper.wrapperEl);
}

function onSwiperResize(swiper: SwiperType) {
  emit("swiper-resize", swiper);
}

function onSlidesUpdated(swiper: SwiperType) {
  emit("slides-updated", swiper);
}

const swiperInstance = ref<SwiperType>();

// Disable/enable swiper during loading
watch(toRef(props, "loading"), (isLoading) => {
  if (!swiperInstance.value) return;
  if (isLoading) {
    swiperInstance.value.disable();
  } else {
    swiperInstance.value.enable();
  }
});

// Scroll to end when new images are added
let prevImageCount = props.images.length;
watch(
  () => props.images.length,
  (newCount) => {
    if (newCount > prevImageCount && swiperInstance.value) {
      nextTick(() => {
        swiperInstance.value?.slideTo(newCount - 1, 300);
      });
    }
    prevImageCount = newCount;
  },
);
</script>

<style lang="scss">
.vc-gallery-filmstrip {
  @apply tw-relative;

  &__swiper {
    @apply tw-overflow-hidden;
  }

  &__slide {
    width: var(--gallery-tile-min, 160px) !important;
    @apply tw-aspect-square;
  }

  // ── Navigation arrows ──
  &__nav {
    @apply tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-z-[var(--z-local-above)]
      tw-flex tw-items-center tw-justify-center
      tw-w-6 tw-h-6 tw-rounded-full tw-border tw-border-solid tw-cursor-pointer
      tw-transition-all tw-duration-150 tw-p-0;
    background: rgba(255, 255, 255, 0.92);
    border-color: var(--secondary-200);
    color: var(--secondary-700);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    &:hover {
      @apply tw-bg-white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &--prev {
      @apply tw-left-0 -tw-translate-x-1/2;
    }

    &--next {
      @apply tw-right-0 tw-translate-x-1/2;
    }

    &.swiper-button-disabled {
      @apply tw-opacity-0 tw-pointer-events-none;
    }
  }
}
</style>
