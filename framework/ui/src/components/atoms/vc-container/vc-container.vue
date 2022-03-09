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
    >
      <div
        class="vc-container__overscroll"
        :class="{ 'vc-container__overscroll_passed': status === 'loosing' }"
        :style="{ height: dist ? `${dist}px` : '0px' }"
      >
        <vc-icon
          icon="fas fa-spinner"
          :style="{ 'font-size': `${dist / 2}px` }"
          class="vc-container__overscroll-icon"
        ></vc-icon>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, nextTick } from "vue";

export default defineComponent({
  name: "VcContainer",
});
</script>

<script lang="ts" setup>
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

/* const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};
 */

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
</script>

<style lang="less">
:root {
  --container-scroll-color: #e1eff9;
  --container-scroll-color-hover: #cce4f5;
  --container-scroll-width: 8px;
  --container-scroll-padding: 8px;
  --container-scroll-shadow: 0 3px 2px rgba(0, 0, 0, 0.1) inset,
    0 -3px 2px rgba(0, 0, 0, 0.1) inset;
}

.vc-container {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;

  &_shadow {
    box-shadow: var(--container-scroll-shadow);
  }

  &__overscroll {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow: hidden;

    &-icon {
      color: #a1c0d4;
      animation: infinite 2s linear spin;
    }

    &_passed &-icon {
      color: #43b0e6;
    }
  }

  &__inner {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    padding: var(--container-scroll-padding);
    scrollbar-color: var(--container-scroll-color);
    scrollbar-width: thin;
    transition-property: transform;

    &::-webkit-scrollbar {
      width: var(--container-scroll-width);
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--container-scroll-color);
      border-radius: calc(var(--container-scroll-width) / 2);
      overflow: hidden;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--container-scroll-color-hover);
    }
  }

  &_nopadding &__inner {
    padding: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
