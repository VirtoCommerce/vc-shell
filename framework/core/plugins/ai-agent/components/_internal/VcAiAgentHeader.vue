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

    <div class="vc-ai-agent-header__controls">
      <VcTooltip
        v-if="isExpanded"
        placement="bottom"
      >
        <div
          class="vc-ai-agent-header__button"
          role="button"
          tabindex="0"
          :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE_HEADER.RESTORE')"
          :aria-keyshortcuts="expandAria"
          @click="$emit('collapse')"
          @keydown.enter.prevent="$emit('collapse')"
          @keydown.space.prevent="$emit('collapse')"
        >
          <VcIcon icon="lucide-minus" />
        </div>
        <template #tooltip>
          <span class="tw-inline-flex tw-items-center tw-gap-2">
            {{ t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.RESTORE") }}
            <ShortcutKbd
              :parts="expandFmt.parts"
              :separated="!isMac"
            />
          </span>
        </template>
      </VcTooltip>
      <VcTooltip
        v-else
        placement="bottom"
      >
        <div
          class="vc-ai-agent-header__button"
          role="button"
          tabindex="0"
          :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE_HEADER.MAXIMIZE')"
          :aria-keyshortcuts="expandAria"
          @click="$emit('expand')"
          @keydown.enter.prevent="$emit('expand')"
          @keydown.space.prevent="$emit('expand')"
        >
          <VcIcon icon="lucide-panel-top" />
        </div>
        <template #tooltip>
          <span class="tw-inline-flex tw-items-center tw-gap-2">
            {{ t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.MAXIMIZE") }}
            <ShortcutKbd
              :parts="expandFmt.parts"
              :separated="!isMac"
            />
          </span>
        </template>
      </VcTooltip>
      <VcTooltip placement="bottom">
        <div
          class="vc-ai-agent-header__button"
          role="button"
          tabindex="0"
          :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE_HEADER.CLOSE')"
          :aria-keyshortcuts="escapeAria"
          @click="$emit('close')"
          @keydown.enter.prevent="$emit('close')"
          @keydown.space.prevent="$emit('close')"
        >
          <VcIcon icon="lucide-x" />
        </div>
        <template #tooltip>
          <span class="tw-inline-flex tw-items-center tw-gap-2">
            {{ t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.CLOSE") }}
            <ShortcutKbd
              :parts="escapeFmt.parts"
              :separated="!isMac"
            />
          </span>
        </template>
      </VcTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import VcVirtoOzLogo from "@core/plugins/ai-agent/components/_internal/VcVirtoOzLogo.vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcTooltip } from "@ui/components/atoms/vc-tooltip";
import ShortcutKbd from "@ui/components/organisms/vc-blade/_internal/toolbar/ShortcutKbd.vue";
import { hotkey, formatShortcut, useKeyboardShortcuts } from "@core/composables/useKeyboardShortcuts";

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

const { t } = useI18n();
const { isMac } = useKeyboardShortcuts();
const escapeFmt = computed(() => formatShortcut(hotkey.escape, isMac));
const expandFmt = computed(() => formatShortcut(hotkey.mod.backslash, isMac));
const escapeAria = computed(() => escapeFmt.value.aria);
const expandAria = computed(() => expandFmt.value.aria);
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

  &__controls {
    @apply tw-flex tw-items-center;
  }

  &__button {
    @apply tw-ml-2.5 tw-cursor-pointer;
    color: var(--blade-header-button-color, var(--neutrals-400));

    &:hover {
      color: var(--blade-header-button-color-hover, var(--neutrals-500));
    }
  }

  &__badge {
    @apply tw-ml-2 tw-text-xs tw-font-medium tw-px-1.5 tw-py-0.5 tw-rounded-full;
    background-color: var(--ai-panel-badge-bg);
    color: var(--ai-panel-badge-color);
  }
}
</style>
