<template>
  <div
    v-if="renaming"
    ref="renameEl"
    class="vc-search-bar__preset-rename"
    @keydown.enter.prevent="commit"
    @keydown.esc.stop="renaming = false"
  >
    <VcInput
      v-model="draft"
      size="small"
      :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.NEW_NAME')"
    />
    <VcButton
      size="sm"
      :disabled="!draft.trim()"
      @click="commit"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.SAVE") }}
    </VcButton>
  </div>
  <div
    v-else
    class="vc-search-bar__preset-actions"
  >
    <button
      v-for="a in actions"
      :key="a.id"
      type="button"
      :class="{ 'vc-search-bar__preset-action--danger': a.danger }"
      :disabled="a.disabled"
      :title="a.title"
      @click="run(a)"
    >
      <VcIcon
        :icon="a.icon"
        size="xs"
      />{{ a.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { VcButton, VcIcon } from "@ui/components/atoms";
import { VcInput } from "@ui/components/molecules";
import type { PresetAction, PresetsApi } from "../composables/usePresets";
import type { StoredPreset } from "../lib/storage";

defineOptions({ name: "PresetActions" });

const props = defineProps<{ preset: StoredPreset; presets: PresetsApi }>();
/** An action ran; the host closes its menu or collapses the row */
const emit = defineEmits<{ done: [] }>();

const actions = computed(() => props.presets.actionsFor(props.preset));
const renaming = ref(false);
const draft = ref("");
const renameEl = ref<HTMLElement>();

function run(a: PresetAction) {
  if (a.id === "rename") {
    draft.value = props.preset.name;
    renaming.value = true;
    nextTick(() => renameEl.value?.querySelector("input")?.select());
    return;
  }
  a.run();
  emit("done");
}

async function commit() {
  if (!draft.value.trim()) return;
  await props.presets.rename(props.preset.id, draft.value);
  renaming.value = false;
  emit("done");
}
</script>

<style lang="scss">
.vc-search-bar {
  &__preset-actions {
    @apply tw-flex tw-flex-col;
    button {
      @apply tw-flex tw-items-center tw-gap-2 tw-text-start tw-text-sm tw-px-2 tw-py-1.5 tw-rounded;
      &:hover:not(:disabled) {
        background: var(--neutrals-100);
      }
      &:disabled {
        opacity: 0.55;
        cursor: default;
      }
    }
  }
  &__preset-action--danger {
    color: var(--danger-600, var(--danger-500));
  }
  &__preset-rename {
    @apply tw-flex tw-items-center tw-gap-1;
    > :first-child {
      @apply tw-flex-1;
    }
  }
}
</style>
