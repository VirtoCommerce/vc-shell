<template>
  <div class="vc-search-bar__all-presets">
    <p
      v-if="!presets.all.value.length"
      class="vc-search-bar__hint"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.EMPTY") }}
    </p>
    <div
      v-for="p in presets.all.value"
      :key="p.id"
      class="vc-search-bar__all-entry"
      :data-preset-id="p.id"
      :class="{ 'vc-search-bar__all-entry--open': expanded === p.id }"
    >
      <div class="vc-search-bar__all-row">
        <button
          type="button"
          class="vc-search-bar__all-main"
          :aria-pressed="presets.lit(p.id)"
          @click="presets.click(p)"
        >
          <VcIcon
            icon="lucide-check"
            size="xs"
            :class="{ 'vc-search-bar__invisible': !presets.lit(p.id) }"
          />
          <span class="vc-search-bar__all-name">{{ p.name }}</span>
          <span class="vc-search-bar__all-origin">
            {{
              $t(
                p.scope === "module"
                  ? "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.FROM_MODULE"
                  : "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.YOURS",
              )
            }}
          </span>
          <VcIcon
            v-if="p.pinned !== false"
            icon="lucide-pin"
            size="xs"
            class="vc-search-bar__all-pin"
            :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.PINNED')"
          />
        </button>
        <button
          v-if="presets.actionsFor(p).length"
          type="button"
          class="vc-search-bar__icon-btn"
          :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.OPTIONS', { name: p.name })"
          :aria-expanded="expanded === p.id"
          @click="expanded = expanded === p.id ? undefined : p.id"
        >
          <VcIcon
            :icon="expanded === p.id ? 'lucide-chevron-up' : 'lucide-ellipsis'"
            size="s"
          />
        </button>
      </div>
      <PresetActions
        v-if="expanded === p.id"
        :preset="p"
        :presets="presets"
        @done="expanded = undefined"
      />
    </div>
    <button
      v-if="presets.hiddenCount.value"
      type="button"
      class="vc-search-bar__show-hidden"
      @click="presets.showHidden()"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.SHOW_HIDDEN", { count: presets.hiddenCount.value }) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcIcon } from "@ui/components/atoms";
import type { PresetsApi } from "../composables/usePresets";
import PresetActions from "./PresetActions.vue";

defineOptions({ name: "AllPresets" });

defineProps<{ presets: PresetsApi }>();
const expanded = ref<string>();
</script>

<style lang="scss">
.vc-search-bar {
  &__all-presets {
    @apply tw-flex tw-flex-col tw-gap-0.5 tw-p-2;
  }
  &__all-entry--open {
    @apply tw-rounded-md tw-pb-1;
    background: var(--neutrals-50);
    .vc-search-bar__preset-actions,
    .vc-search-bar__preset-rename {
      @apply tw-ps-6 tw-pe-1;
    }
  }
  &__all-row {
    @apply tw-flex tw-items-center tw-gap-1;
  }
  &__all-main {
    @apply tw-flex tw-flex-1 tw-min-w-0 tw-items-center tw-gap-2 tw-text-start tw-text-sm tw-px-2 tw-py-1.5 tw-rounded;
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__invisible {
    visibility: hidden;
  }
  &__all-name {
    @apply tw-flex-1 tw-truncate;
  }
  &__all-origin {
    @apply tw-text-xs tw-shrink-0;
    color: var(--neutrals-600);
  }
  &__all-pin {
    color: var(--neutrals-600);
  }
  &__hint {
    @apply tw-m-0 tw-text-xs tw-p-2;
    color: var(--neutrals-600);
  }
  &__show-hidden {
    @apply tw-text-xs tw-text-start tw-px-2 tw-pt-2 tw-mt-1;
    border-top: 1px solid var(--neutrals-200);
    color: var(--primary-700);
  }
}
</style>
