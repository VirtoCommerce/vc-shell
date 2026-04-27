<template>
  <div
    class="dashboard-widget-skeleton"
    aria-hidden="true"
  >
    <div class="dashboard-widget-skeleton__header">
      <div class="dashboard-widget-skeleton__icon" />
      <div class="dashboard-widget-skeleton__title" />
    </div>
    <div class="dashboard-widget-skeleton__stats">
      <div class="dashboard-widget-skeleton__stat" />
      <div class="dashboard-widget-skeleton__stat" />
      <div class="dashboard-widget-skeleton__stat" />
    </div>
    <div class="dashboard-widget-skeleton__body">
      <div class="dashboard-widget-skeleton__line dashboard-widget-skeleton__line--w80" />
      <div class="dashboard-widget-skeleton__line dashboard-widget-skeleton__line--w60" />
      <div class="dashboard-widget-skeleton__line dashboard-widget-skeleton__line--w90" />
      <div class="dashboard-widget-skeleton__line dashboard-widget-skeleton__line--w70" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
:root {
  --dashboard-widget-skeleton-bg: var(--dashboard-widget-card-background, var(--additional-50));
  --dashboard-widget-skeleton-border-color: var(--dashboard-widget-card-border-color, var(--neutrals-200));
  --dashboard-widget-skeleton-radius: var(--dashboard-widget-card-border-radius, 8px);
  --dashboard-widget-skeleton-shadow: var(
    --dashboard-widget-card-shadow,
    0 1px 3px rgba(0, 0, 0, 0.08) 0 1px 2px rgba(0, 0, 0, 0.06)
  );
  --dashboard-widget-skeleton-shimmer-from: var(--neutrals-100);
  --dashboard-widget-skeleton-shimmer-to: var(--neutrals-200);
}

@keyframes dashboard-widget-skeleton-shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.dashboard-widget-skeleton {
  @apply tw-overflow-hidden tw-h-full tw-flex tw-flex-col;
  background: var(--dashboard-widget-skeleton-bg);
  border: 1px solid var(--dashboard-widget-skeleton-border-color);
  border-radius: var(--dashboard-widget-skeleton-radius);
  box-shadow: var(--dashboard-widget-skeleton-shadow);

  %shimmer {
    background: linear-gradient(
      90deg,
      var(--dashboard-widget-skeleton-shimmer-from) 0%,
      var(--dashboard-widget-skeleton-shimmer-to) 50%,
      var(--dashboard-widget-skeleton-shimmer-from) 100%
    );
    background-size: 800px 100%;
    animation: dashboard-widget-skeleton-shimmer 1.4s ease-in-out infinite;
    border-radius: 4px;
  }

  &__header {
    @apply tw-px-5 tw-py-4 tw-flex tw-items-center tw-gap-3;
  }

  &__icon {
    @apply tw-w-9 tw-h-9 tw-rounded-lg tw-flex-shrink-0;
    @extend %shimmer;
  }

  &__title {
    @apply tw-h-5 tw-flex-1 tw-max-w-[180px];
    @extend %shimmer;
  }

  &__stats {
    @apply tw-px-5 tw-py-3 tw-flex tw-items-center tw-gap-6;
    border-top: 1px solid var(--dashboard-widget-skeleton-border-color);
    border-bottom: 1px solid var(--dashboard-widget-skeleton-border-color);
  }

  &__stat {
    @apply tw-h-6 tw-flex-1;
    @extend %shimmer;
  }

  &__body {
    @apply tw-flex-1 tw-min-h-0 tw-px-5 tw-py-4 tw-flex tw-flex-col tw-gap-3;
  }

  &__line {
    @apply tw-h-3;
    @extend %shimmer;

    &--w60 {
      @apply tw-w-3/5;
    }
    &--w70 {
      @apply tw-w-7/12;
    }
    &--w80 {
      @apply tw-w-4/5;
    }
    &--w90 {
      @apply tw-w-11/12;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-widget-skeleton {
    %shimmer {
      animation: none;
    }
  }
}
</style>
