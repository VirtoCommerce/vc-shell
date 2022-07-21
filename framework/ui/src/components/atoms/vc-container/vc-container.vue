<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container_shadow': shadow && scroll,
        'vc-container_nopadding': noPadding,
      },
    ]"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
  >
    <div
      ref="component"
      class="vc-container__inner"
      :style="{
        transform: dist ? `translate3d(0, ${dist}px, 0)` : '',
      }"
      @scroll="onScroll"
    >
      <div
        class="vc-container__overscroll"
        :class="{ 'vc-container__overscroll_passed': status === 'loosing' }"
        :style="{ height: dist ? `${dist}px` : '0px' }"
      >
        <VcIcon
          icon="fas fa-spinner"
          :style="{ 'font-size': `${dist / 2}px` }"
          class="vc-container__overscroll-icon"
        ></VcIcon>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from "vue";
const props = defineProps({
  shadow: {
    type: Boolean,
    default: false,
  },

  noPadding: {
    type: Boolean,
    default: false,
  },

  usePtr: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["scroll:ptr", "scroll:infinite"]);
const component = ref<HTMLElement>();
const scroll = ref(false);
const startY = ref(0);
const ceiling = ref();
const pullDist = ref(60);
const dist = ref(0);
const status = ref("normal");
const delta = ref(0);

onMounted(() => {
  const observer = new ResizeObserver(() => {
    scroll.value = (component.value &&
      component.value.clientHeight < component.value.scrollHeight) as boolean;
  });

  if (component.value) {
    observer.observe(component.value);
  }
});

const touchable = computed(
  () => status.value !== "refresh" && status.value !== "success"
);

const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};
defineExpose({
  scrollTop,
});

function touchStart(e: TouchEvent): void {
  if (!touchable.value) {
    return;
  }
  checkPullStart(e);
}

function touchMove(e: TouchEvent): void {
  if (props.usePtr) {
    const touch = e.touches[0];
    if (!touchable.value) {
      return;
    }

    if (!ceiling.value) {
      checkPullStart(e);
    }

    delta.value = touch.clientY - startY.value;

    if (ceiling.value && delta.value >= 0 && delta.value < 80) {
      e.preventDefault();

      setStatus(ease(delta.value));
    }
  }
}

function touchEnd(): void {
  if (delta.value && touchable.value) {
    if (status.value === "loosing") {
      nextTick(() => emit("scroll:ptr"));
    }
    setStatus(0);
  }
}

function getScrollTop(el: HTMLElement) {
  const top = el.scrollTop;

  return Math.max(top, 0);
}

function checkPullStart(e: TouchEvent) {
  ceiling.value = getScrollTop(component.value as HTMLElement) === 0;

  if (ceiling.value) {
    startY.value = e.touches[0].clientY;
  }
}

function setStatus(distance: number) {
  let stat;
  if (distance === 0) {
    stat = "normal";
  } else {
    stat = distance < pullDist.value ? "pulling" : "loosing";
  }
  dist.value = distance;
  if (stat !== status.value) {
    status.value = stat;
  }
}

function ease(distance: number) {
  const pullDistance = +pullDist.value;
  if (distance > pullDistance) {
    if (distance < pullDistance * 2) {
      distance = pullDistance + (distance - pullDistance) / 2;
    } else {
      distance = pullDistance * 1.5 + (distance - pullDistance * 2) / 4;
    }
  }
  return Math.round(distance);
}

function onScroll() {
  let element = component.value as HTMLElement;
  if (element.scrollTop + element.clientHeight === element.scrollHeight) {
    nextTick(() => emit("scroll:infinite"));
  }
}
</script>

<style lang="scss">
:root {
  --container-scroll-color: #e1eff9;
  --container-scroll-color-hover: #cce4f5;
  --container-scroll-width: 8px;
  --container-scroll-padding: 8px;
  --container-scroll-shadow: 0 3px 2px rgba(0, 0, 0, 0.1) inset,
    0 -3px 2px rgba(0, 0, 0, 0.1) inset;
}

.vc-container {
  @apply w-full h-full overflow-hidden box-border flex flex-col relative;

  &_shadow {
    @apply shadow-[0_3px_2px_rgba(0,0,0,0.1)_inset];
  }

  &__overscroll {
    @apply relative w-full flex items-start justify-center overflow-hidden;

    &-icon {
      @apply text-[color:#a1c0d4] animate-spin;
    }

    &_passed &-icon {
      @apply text-[#43b0e6];
    }
  }

  &__inner {
    @apply relative overflow-y-auto overflow-x-hidden
    flex-1 p-[var(--container-scroll-padding)]
    transition-transform [scrollbar-color:var(--container-scroll-color)] [scrollbar-width:thin];

    &::-webkit-scrollbar {
      @apply w-[var(--container-scroll-width)] bg-transparent;
    }

    &::-webkit-scrollbar-track {
      @apply bg-transparent;
    }

    &::-webkit-scrollbar-thumb {
      @apply bg-[color:var(--container-scroll-color)]
      rounded-[calc(var(--container-scroll-width)/2)]
      overflow-x-hidden
      hover:bg-[color:var(--container-scroll-color-hover)];
    }
  }

  &_nopadding &__inner {
    @apply p-0;
  }
}
</style>
