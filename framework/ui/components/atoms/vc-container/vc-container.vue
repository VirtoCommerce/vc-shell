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
        <VcIcon
          :icon="status === 'pulling' ? 'fas fa-arrow-down' : 'fas fa-sync'"
          :class="[iconClass]"
          :style="{ transform: status === 'pulling' ? `rotate(${dist * 3}deg)` : '' }"
        ></VcIcon>
        <span v-if="status === 'pulling'">{{ $t("COMPONENTS.ATOMS.VC_CONTAINER.PULL_TO_REFRESH") }}</span>
        <span v-else-if="status === 'loosing'">{{ $t("COMPONENTS.ATOMS.VC_CONTAINER.REFRESHING") }}</span>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { VcIcon } from "./../vc-icon";

export interface Props {
  shadow?: boolean;
  noPadding?: boolean;
  usePtr?: boolean;
}

export interface Emits {
  (event: "scroll:ptr"): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

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
    scroll.value = (component.value && component.value.clientHeight < component.value.scrollHeight) as boolean;
  });

  if (component.value) {
    observer.observe(component.value);
  }
});

const touchable = computed(() => status.value !== "refresh" && status.value !== "success");

const iconClass = computed(() => {
  if (status.value === "loosing") {
    return "vc-container__overscroll-icon_refresh";
  } else if (status.value === "pulling") {
    return "vc-container__overscroll-icon_pulling";
  }
  return "vc-container__overscroll-icon";
});

const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};

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

defineExpose({
  scrollTop,
  component,
});
</script>

<style lang="scss">
:root {
  --container-scroll-color: #e1eff9;
  --container-scroll-color-hover: #cce4f5;
  --container-scroll-width: 8px;
  --container-scroll-padding: 8px;
  --container-scroll-shadow: 0 3px 2px rgba(0, 0, 0, 0.1) inset, 0 -3px 2px rgba(0, 0, 0, 0.1) inset;
}

.vc-container {
  @apply tw-w-full tw-h-full tw-overflow-hidden tw-box-border tw-flex tw-flex-col tw-relative;

  &_shadow {
    @apply tw-shadow-[0_3px_2px_rgba(0,0,0,0.1)_inset];
  }

  &__overscroll {
    @apply tw-relative tw-w-full tw-flex tw-items-start tw-justify-center tw-overflow-hidden tw-gap-2;

    &_passed {
      @apply tw-text-[#43b0e6];
    }
  }

  &__overscroll-icon {
    @apply tw-text-[color:#a1c0d4];

    &_pulling {
      @apply tw-text-[color:#a1c0d4];
    }

    &_refresh {
      animation: tw-spin 2s linear infinite;
    }
  }

  &__overscroll span {
    @apply tw-mb-2 tw-text-sm tw-text-gray-500;
  }

  &__inner {
    @apply tw-relative tw-overflow-y-auto tw-overflow-x-hidden
    tw-flex-1 tw-p-[var(--container-scroll-padding)]
    tw-transition-transform [scrollbar-color:var(--container-scroll-color)] [scrollbar-width:thin];

    &::-webkit-scrollbar {
      @apply tw-w-[var(--container-scroll-width)] tw-bg-transparent;
    }

    &::-webkit-scrollbar-track {
      @apply tw-bg-transparent;
    }

    &::-webkit-scrollbar-thumb {
      @apply tw-bg-[color:var(--container-scroll-color)]
      tw-rounded-[calc(var(--container-scroll-width)/2)]
      tw-overflow-x-hidden
      hover:tw-bg-[color:var(--container-scroll-color-hover)];
    }
  }

  &_nopadding &__inner {
    @apply tw-p-0;
  }
}

@keyframes tw-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
