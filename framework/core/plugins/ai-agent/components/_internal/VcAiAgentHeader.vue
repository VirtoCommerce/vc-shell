<template>
  <div class="vc-ai-agent-header">
    <div class="vc-ai-agent-header__icon">
      <VcVirtoOzLogo
        :width="22"
        :height="24"
        show-dots
      />
    </div>

    <div class="vc-ai-agent-header__wrapper">
      <div class="vc-ai-agent-header__content">
        <div class="vc-ai-agent-header__title">
          {{ title }}
        </div>
      </div>
    </div>

    <HeaderControls
      :maximized="isExpanded"
      @expand="$emit('expand')"
      @collapse="$emit('collapse')"
      @close="$emit('close')"
    />
  </div>
</template>

<script lang="ts" setup>
import VcVirtoOzLogo from "@core/plugins/ai-agent/components/_internal/VcVirtoOzLogo.vue";
import HeaderControls from "@ui/components/shared/HeaderControls.vue";

defineProps<{
  title?: string;
  isExpanded: boolean;
  itemsCount?: number;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "expand"): void;
  (e: "collapse"): void;
}>();
</script>

<style lang="scss">
.vc-ai-agent-header {
  @apply tw-shrink-0 tw-flex tw-items-center tw-py-0 tw-px-6 tw-border-solid tw-border-b;
  height: var(--blade-header-height, 70px);
  background-color: var(--blade-header-background-color, var(--additional-50));
  border-color: var(--blade-header-border-color, var(--neutrals-200));

  &__left {
    @apply tw-flex tw-flex-row tw-items-center;
  }

  &__icon {
    @apply tw-mr-3;
    color: var(--primary-500);
  }

  &__wrapper {
    @apply tw-flex tw-items-center tw-justify-between tw-grow tw-basis-0 tw-overflow-hidden;
  }

  &__content {
    @apply tw-overflow-hidden;
  }

  &__title {
    @apply tw-truncate tw-font-semibold;
    color: var(--blade-header-title-color, var(--neutrals-950));
    font-size: var(--blade-header-title-font-size, 19px);
  }

  &__badge {
    @apply tw-ml-2 tw-text-xs tw-font-medium tw-px-1.5 tw-py-0.5 tw-rounded-full;
    background-color: var(--ai-panel-badge-bg);
    color: var(--ai-panel-badge-color);
  }
}
</style>
