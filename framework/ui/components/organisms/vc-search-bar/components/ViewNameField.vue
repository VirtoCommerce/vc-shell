<template>
  <div
    ref="root"
    class="vc-search-bar__view-name-field"
    @keydown.enter="onEnter"
    @keydown.esc.stop.prevent="emit('cancel')"
  >
    <VcInput
      v-model="draft"
      size="small"
      :placeholder="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.NAME_PLACEHOLDER')"
      :aria-label="label"
    />
    <button
      v-if="cancelable"
      type="button"
      class="vc-search-bar__view-text-btn vc-search-bar__view-text-btn--muted"
      @click="emit('cancel')"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.CANCEL") }}
    </button>
    <VcButton
      size="sm"
      :disabled="!draft.trim()"
      @click="commit"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.SAVE") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { VcButton } from "@ui/components/atoms";
import { VcInput } from "@ui/components/molecules";

defineOptions({ name: "ViewNameField" });

const props = defineProps<{
  /** Accessible name of the input */
  label: string;
  initial?: string;
  cancelable?: boolean;
}>();
const emit = defineEmits<{ save: [name: string]; cancel: [] }>();

const root = ref<HTMLElement>();
const draft = ref(props.initial ?? "");

onMounted(() => {
  const input = root.value?.querySelector("input");
  input?.focus();
  input?.select();
});

// Enter on the buttons keeps its native click
function onEnter(e: KeyboardEvent) {
  if (!(e.target instanceof HTMLInputElement)) return;
  e.preventDefault();
  commit();
}

function commit() {
  const name = draft.value.trim();
  if (name) emit("save", name);
}
</script>

<style lang="scss">
.vc-search-bar {
  &__view-name-field {
    @apply tw-flex tw-items-center tw-gap-1 tw-w-full;
    > :first-child {
      @apply tw-flex-1 tw-min-w-0;
    }
  }
  &__view-text-btn {
    @apply tw-inline-flex tw-items-center tw-shrink-0 tw-rounded tw-px-2 tw-font-medium;
    height: 28px;
    font-size: 12.5px;
    color: var(--primary-700);
    &:hover:not(:disabled) {
      background: var(--primary-50);
    }
    &--muted {
      color: var(--neutrals-600);
      &:hover:not(:disabled) {
        background: var(--neutrals-100);
      }
    }
  }
}
</style>
