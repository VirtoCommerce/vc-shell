<template>
  <div class="vc-search-bar__phone-tray">
    <button
      type="button"
      class="vc-search-bar__phone-presets"
      :class="{ 'vc-search-bar__phone-presets--on': anyLit }"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.LABEL')"
      :title="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.LABEL')"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :disabled="disabled"
      @click="open = !open"
    >
      <VcIcon
        icon="lucide-bookmark"
        size="s"
      />
    </button>
    <MenuHost
      v-if="open"
      sheet
      :title="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.LABEL')"
      @close="open = false"
    >
      <AllPresets :presets="presets" />
      <div
        v-if="presets.canSave.value"
        class="vc-search-bar__phone-save"
      >
        <PresetSaveInline
          v-if="presets.saving.value"
          :presets="presets"
        />
        <!-- stays mounted while saving, so focus can come back to it -->
        <button
          v-show="!presets.saving.value"
          type="button"
          class="vc-search-bar__save"
          @click="presets.startSave()"
        >
          <VcIcon
            icon="lucide-bookmark-plus"
            size="xs"
          />
          {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.SAVE_AS") }}
        </button>
      </div>
    </MenuHost>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { VcIcon } from "@ui/components/atoms";
import type { PresetsApi } from "../composables/usePresets";
import AllPresets from "./AllPresets.vue";
import PresetSaveInline from "./PresetSaveInline.vue";
import MenuHost from "./MenuHost.vue";

defineOptions({ name: "PhonePresets" });

const props = defineProps<{ presets: PresetsApi; disabled?: boolean }>();

const open = ref(false);
const anyLit = computed(() => props.presets.all.value.some((p) => props.presets.lit(p.id)));
</script>

<style lang="scss">
.vc-search-bar {
  &__phone-tray {
    @apply tw-flex tw-shrink-0;
  }
  &__phone-presets {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-shrink-0;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    border: 1px solid var(--neutrals-300);
    color: var(--neutrals-700);
    background: var(--additional-50);

    &--on {
      border-color: var(--primary-500);
      background: var(--primary-50);
      color: var(--primary-700);
    }
    &:disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed;
    }
  }
  &__phone-save {
    @apply tw-px-4 tw-pb-3;
    .vc-search-bar__save {
      margin-inline-start: 0;
    }
  }
}
</style>
