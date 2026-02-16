<template>
  <div
    ref="containerRef"
    class="vc-pull-to-refresh"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Refresh indicator (hidden above content) -->
    <div
      class="vc-pull-to-refresh__indicator"
      :style="indicatorStyle"
    >
      <div class="vc-pull-to-refresh__indicator-content">
        <VcIcon
          :icon="indicatorIcon"
          class="vc-pull-to-refresh__icon"
          :class="iconClasses"
        />
        <span class="vc-pull-to-refresh__text">{{ statusText }}</span>
      </div>
    </div>

    <!-- Content with spring animation -->
    <div
      class="vc-pull-to-refresh__content"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PullToRefresh - Pull-to-refresh component with spring animation
 *
 * Provides iOS-like pull-to-refresh functionality for mobile views.
 * Uses spring physics animation for natural feel.
 *
 * Features:
 * - Spring physics animation (matching swipe actions)
 * - Icon rotates 180° when threshold passed
 * - Only active on mobile
 * - Disabled when content is scrolled down (scrollTop > 0)
 * - Disabled when refreshing=true
 */
import { ref, computed, inject, type Ref } from "vue";
import { useI18n } from "vue-i18n";

export interface PullToRefreshProps {
  /** Enable/disable pull-to-refresh */
  enabled?: boolean;
  /** Distance threshold to trigger refresh (px) */
  threshold?: number;
  /** Loading state - parent controls when refresh is complete */
  refreshing?: boolean;
  /** Custom text for "pull" state (overrides i18n) */
  pullText?: string;
  /** Custom text for "release" state (overrides i18n) */
  releaseText?: string;
  /** Custom text for "refreshing" state (overrides i18n) */
  refreshingText?: string;
}

const props = withDefaults(defineProps<PullToRefreshProps>(), {
  enabled: true,
  threshold: 60,
  refreshing: false,
  pullText: undefined,
  releaseText: undefined,
  refreshingText: undefined,
});

// i18n
const { t } = useI18n({ useScope: "global" });

const emit = defineEmits<{
  /** Triggered when user releases after passing threshold */
  refresh: [];
}>();

// Check if mobile via inject (provided by VcDataTable or parent)
const isMobile = inject<Ref<boolean>>("isMobile", ref(true));

// Refs
const containerRef = ref<HTMLElement | null>(null);

// Pull state
const pullDistance = ref(0);
const isPulling = ref(false);
const canRelease = ref(false);
const isAnimating = ref(false);
const animationId = ref<number | null>(null);

// Touch tracking
const startY = ref(0);
const velocity = ref(0);
const lastTime = ref(0);
const lastY = ref(0);

// Spring animation constants (matching swipe actions)
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.7;
const SPRING_MASS = 1;

// Indicator height
const INDICATOR_HEIGHT = 60;

// Computed states
const isActive = computed(() => {
  return props.enabled && isMobile.value && !props.refreshing;
});

const indicatorIcon = computed(() => {
  if (props.refreshing) {
    return "fas fa-sync";
  }
  return "fas fa-arrow-down";
});

const iconClasses = computed(() => ({
  "vc-pull-to-refresh__icon--rotate": canRelease.value && !props.refreshing,
  "vc-pull-to-refresh__icon--spin": props.refreshing,
}));

const statusText = computed(() => {
  if (props.refreshing) {
    return props.refreshingText ?? t("COMPONENTS.ORGANISMS.VC_TABLE.REFRESHING");
  }
  if (canRelease.value) {
    return props.releaseText ?? t("COMPONENTS.ORGANISMS.VC_TABLE.RELEASE_TO_REFRESH");
  }
  return props.pullText ?? t("COMPONENTS.ORGANISMS.VC_TABLE.PULL_TO_REFRESH");
});

const indicatorStyle = computed(() => {
  const offset = Math.min(pullDistance.value, INDICATOR_HEIGHT + 20);
  return {
    transform: `translateY(${offset - INDICATOR_HEIGHT}px)`,
    opacity: Math.min(pullDistance.value / props.threshold, 1),
  };
});

const contentStyle = computed(() => {
  return {
    transform: `translateY(${pullDistance.value}px)`,
  };
});

// Check if container is scrolled to top
function isAtTop(): boolean {
  if (!containerRef.value) return true;

  // Check if container or any scrollable parent is scrolled
  let element: HTMLElement | null = containerRef.value;
  while (element) {
    if (element.scrollTop > 0) {
      return false;
    }
    element = element.parentElement;
  }
  return true;
}

// Spring animation
function springAnimation(targetValue: number, duration = 300) {
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value);
  }

  const startValue = pullDistance.value;
  const startTime = performance.now();
  let springVelocity = velocity.value;
  let currentValue = startValue;

  isAnimating.value = true;

  function animate(time: number) {
    const elapsed = time - startTime;

    if (elapsed < duration) {
      const springForce = (targetValue - currentValue) * SPRING_STIFFNESS;
      const dampingForce = springVelocity * SPRING_DAMPING;
      const acceleration = (springForce - dampingForce) / SPRING_MASS;

      springVelocity += acceleration;
      currentValue += springVelocity;

      pullDistance.value = Math.max(0, currentValue);

      animationId.value = requestAnimationFrame(animate);
    } else {
      pullDistance.value = targetValue;
      isAnimating.value = false;
      animationId.value = null;
    }
  }

  animationId.value = requestAnimationFrame(animate);
}

// Touch handlers
function onTouchStart(e: TouchEvent) {
  if (!isActive.value || isAnimating.value) return;
  if (!isAtTop()) return;

  const touch = e.touches[0];
  startY.value = touch.clientY;
  velocity.value = 0;
  lastTime.value = Date.now();
  lastY.value = touch.clientY;
  isPulling.value = true;
}

function onTouchMove(e: TouchEvent) {
  if (!isActive.value || !isPulling.value || isAnimating.value) return;

  const touch = e.touches[0];
  const currentY = touch.clientY;
  const deltaY = currentY - startY.value;

  // Only handle pull down
  if (deltaY < 0) {
    isPulling.value = false;
    pullDistance.value = 0;
    return;
  }

  // Calculate velocity for inertia
  const now = Date.now();
  const dt = now - lastTime.value;
  if (dt > 0) {
    velocity.value = (currentY - lastY.value) / dt;
  }
  lastTime.value = now;
  lastY.value = currentY;

  // Apply resistance as user pulls further
  const resistance = Math.max(0.4, 1 - deltaY / 300);
  let newPullDistance = deltaY * resistance;

  // Cap at max pull distance
  const maxPull = props.threshold * 2.5;
  newPullDistance = Math.min(newPullDistance, maxPull);

  pullDistance.value = newPullDistance;
  canRelease.value = newPullDistance >= props.threshold;
}

function onTouchEnd() {
  if (!isPulling.value) return;

  isPulling.value = false;

  if (canRelease.value && !props.refreshing) {
    // Trigger refresh
    emit("refresh");
    // Animate to threshold height (show indicator while refreshing)
    springAnimation(INDICATOR_HEIGHT);
  } else {
    // Animate back to 0
    springAnimation(0);
  }

  canRelease.value = false;
}

// Watch for refreshing prop to animate back when done
import { watch } from "vue";

watch(
  () => props.refreshing,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      // Refreshing finished, animate back to 0
      springAnimation(0);
    }
  }
);

// Cleanup on unmount
import { onUnmounted } from "vue";

onUnmounted(() => {
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value);
  }
});

// Expose for testing
defineExpose({
  pullDistance,
  canRelease,
  isPulling,
});
</script>

<style lang="scss">
:root {
  --ptr-indicator-bg: var(--additional-50);
  --ptr-indicator-text: var(--neutrals-600);
  --ptr-indicator-icon: var(--primary-500);
}

.vc-pull-to-refresh {
  // overflow: clip (not hidden!) — clips the pull indicator visually
  // but does NOT create a scroll container. With `hidden`, touch scroll events
  // get trapped and never reach the parent overflow-y: auto element.
  @apply tw-relative;
  overflow: clip;

  &__indicator {
    @apply tw-absolute tw-left-0 tw-right-0 tw-top-0 tw-flex tw-items-center tw-justify-center;
    @apply tw-bg-[var(--ptr-indicator-bg)] tw-text-[var(--ptr-indicator-text)];
    height: 60px;
    z-index: 10;
  }

  &__indicator-content {
    @apply tw-flex tw-items-center tw-gap-2;
  }

  &__icon {
    @apply tw-text-xl tw-text-[var(--ptr-indicator-icon)] tw-transition-transform tw-duration-200;

    &--rotate {
      transform: rotate(180deg);
    }

    &--spin {
      animation: ptr-spin 1s linear infinite;
    }
  }

  &__text {
    @apply tw-text-sm tw-font-medium;
  }

  &__content {
    @apply tw-relative tw-will-change-transform;
  }
}

@keyframes ptr-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
