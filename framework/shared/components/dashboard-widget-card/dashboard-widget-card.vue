<template>
  <div class="dashboard-widget-card">
    <div class="dashboard-widget-card__header-wrapper">
      <div class="dashboard-widget-card__header">
        <slot name="header">
          <div class="dashboard-widget-card__header-content">
            <VcIcon
              v-if="icon"
              class="dashboard-widget-card__icon"
              :icon="icon"
              size="xl"
            ></VcIcon>
            <div class="dashboard-widget-card__header">{{ props.header }}</div>
          </div>
        </slot>
      </div>
      <div class="dashboard-widget-card__actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="dashboard-widget-card__body">
      <div
        v-if="$isDesktop.value || !$slots['mobile-content']"
        v-loading="loading"
        class="dashboard-widget-card__body-content"
      >
        <slot name="content"></slot>
      </div>
      <!-- <div
        v-if="$isMobile.value && $slots['mobile-content']"
        v-loading="loading"
        class="dashboard-widget-card__body-mobile-content"
      >
        <slot name="mobile-content"></slot>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  header?: string;
  icon?: string;
  loading?: boolean;
}

const props = defineProps<Props>();

defineSlots<{
  header: void;
  actions: void;
  content: void;
  // TODO: implement
  // "mobile-content": void;
}>();
</script>

<style lang="scss">
:root {
  --dashboard-widget-card-header-color: var(--additional-50);
  --dashboard-widget-card-header-text-color: var(--neutrals-950);
  --dashboard-widget-card-icon-color: var(--neutrals-950);
  --dashboard-widget-card-header-border-color: var(--neutrals-200);
}

.dashboard-widget-card {
  @apply tw-rounded-md tw-overflow-hidden tw-h-full tw-bg-[var(--dashboard-widget-card-header-color)] tw-flex tw-flex-col;

  &__header-wrapper {
    @apply tw-p-6 tw-bg-[var(--dashboard-widget-card-header-color)] tw-rounded-t-md tw-border tw-border-[color:var(--dashboard-widget-card-header-border-color)] tw-border-solid tw-flex tw-justify-between tw-items-center tw-text-xl tw-font-bold tw-text-[var(--dashboard-widget-card-header-text-color)];
  }

  &__actions {
    @apply tw-flex tw-items-center tw-gap-[14px];
  }

  &__header {
    @apply tw-flex;
  }

  &__icon {
    @apply tw-text-[var(--dashboard-widget-card-icon-color)];
  }

  &__header-content {
    @apply tw-flex tw-items-center tw-gap-[14px];
  }

  &__body {
    @apply tw-flex tw-flex-col [height:-webkit-fill-available];
  }

  &__body-content {
    @apply tw-flex-1;
  }

  &__body-mobile-content {
    @apply tw-flex-1 tw-flex;
  }
}
</style>
