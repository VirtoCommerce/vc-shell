<template>
  <div
    ref="root"
    class="vc-search-bar__save-inline"
    @keydown.enter.prevent="commit"
    @keydown.esc.stop="presets.cancelSave()"
  >
    <VcInput
      v-model="draft"
      size="small"
      :placeholder="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.NAME')"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.NAME')"
    />
    <VcButton
      size="sm"
      :disabled="!draft.trim()"
      @click="commit"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.SAVE") }}
    </VcButton>
    <button
      type="button"
      class="vc-search-bar__icon-btn"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.CANCEL')"
      @click="presets.cancelSave()"
    >
      <VcIcon
        icon="lucide-x"
        size="s"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { VcButton, VcIcon } from "@ui/components/atoms";
import { VcInput } from "@ui/components/molecules";
import type { PresetsApi } from "../composables/usePresets";

defineOptions({ name: "PresetSaveInline" });

const props = defineProps<{ presets: PresetsApi }>();

const root = ref<HTMLElement>();
const draft = props.presets.draft;

onMounted(() => {
  const input = root.value?.querySelector("input");
  input?.focus();
  input?.select();
});

function commit() {
  void props.presets.commitSave(draft.value);
}
</script>

<style lang="scss">
.vc-search-bar {
  &__save-inline {
    @apply tw-flex tw-items-center tw-gap-1 tw-shrink-0;
    min-width: 260px;
    > :first-child {
      @apply tw-flex-1;
    }
  }
  // Desktop: a gap from the pills it follows
  &__pills &__save-inline {
    margin-inline-start: 18px;
  }
  // the phone presets sheet
  &__phone-save &__save-inline {
    min-width: 0;
  }
  &__icon-btn {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded tw-shrink-0;
    width: 24px;
    height: 24px;
    &:hover {
      background: var(--neutrals-100);
    }
  }
}
</style>
