<template>
  <div
    ref="rootEl"
    class="vc-search-bar__search"
    :class="{
      'vc-search-bar__search--collapsible': collapsed,
      'vc-search-bar__search--open': collapsed && open,
      'vc-search-bar__search--full': full,
      'vc-search-bar__search--disabled': disabled,
    }"
    @focusout="onFocusOut"
  >
    <!-- the collapsible box keeps its icon in place while it widens into the field -->
    <VcIcon
      v-if="collapsed"
      icon="lucide-search"
      size="s"
      class="vc-search-bar__search-icon"
    />
    <button
      v-if="collapsed && !open"
      type="button"
      class="vc-search-bar__search-btn"
      :aria-label="label"
      :title="label"
      :disabled="disabled"
      @click="openField"
    />
    <VcInput
      v-else
      :model-value="modelValue"
      :placeholder="label"
      :aria-label="label"
      :disabled="disabled"
      size="small"
      clearable
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    >
      <template
        v-if="!collapsed"
        #prepend-inner
      >
        <VcIcon
          icon="lucide-search"
          size="s"
          class="vc-search-bar__search-icon"
        />
      </template>
    </VcInput>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import { VcInput } from "@ui/components/molecules";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  /** Shows a bordered button that widens into the field on click */
  collapsed?: boolean;
  /** Fills the row instead of the fixed width */
  full?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "open-change": [open: boolean];
}>();

const { t } = useI18n({ useScope: "global" });
const label = computed(() => props.placeholder ?? t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.SEARCH_PLACEHOLDER"));

const rootEl = ref<HTMLElement>();
// an active query must stay visible, so a collapsed field with text starts open
const open = ref(!!props.collapsed && !!props.modelValue);
// removing the focused button on open makes the browser fire a focusout that must not fold the field
let opening = false;

onMounted(() => {
  if (open.value) emit("open-change", true);
});

function setOpen(value: boolean) {
  if (open.value === value) return;
  open.value = value;
  emit("open-change", value);
}

async function openField() {
  opening = true;
  setOpen(true);
  await nextTick();
  rootEl.value?.querySelector("input")?.focus();
  opening = false;
}

function onFocusOut(e: FocusEvent) {
  if (!props.collapsed || !open.value || opening) return;
  if (rootEl.value?.contains(e.relatedTarget as Node | null)) return;
  if (!props.modelValue) setOpen(false);
}

// the clear button can empty the field after focus has already left it
watch(
  () => props.modelValue,
  (value) => {
    if (!value && open.value && !rootEl.value?.contains(document.activeElement)) setOpen(false);
  },
);

// leaving the collapsed layout drops the open state; entering it keeps an active query or a focused field open
watch(
  () => props.collapsed,
  (collapsed) => {
    setOpen(collapsed && (!!props.modelValue || !!rootEl.value?.contains(document.activeElement)));
  },
);
</script>

<style lang="scss">
.vc-search-bar {
  &__search {
    @apply tw-shrink-0;
    width: 180px;

    &--full {
      @apply tw-flex-1 tw-min-w-0;
      width: auto;
    }
    &--collapsible {
      @apply tw-relative tw-flex tw-items-center;
      flex: none;
      width: 30px;
      height: 30px;
      overflow: hidden;
      border: 1px solid var(--neutrals-300);
      border-radius: 6px;
      background: var(--additional-50);
      box-shadow: 0 1px 1px rgb(0 0 0 / 4%);
      color: var(--neutrals-500);
      transition:
        width 0.3s cubic-bezier(0.2, 0.9, 0.25, 1.05),
        border-color 0.2s,
        box-shadow 0.2s,
        background-color 0.2s,
        color 0.2s;

      .vc-search-bar__search-icon {
        @apply tw-absolute tw-pointer-events-none;
        left: 6px;
        color: inherit;
      }
      // the box draws the field; the input only fades in once the box has widened
      .vc-input {
        @apply tw-w-full;
        --input-height-small: 28px;
        --input-padding: 6px;
        --input-border-color: transparent;
        --input-border-color-focus: transparent;
        --input-background-color: transparent;
        padding-inline-start: 22px;
        animation: vc-search-bar-fade-in 0.15s 0.12s both;
      }
      .vc-input .vc-input__field-wrapper {
        box-shadow: none;
      }
    }
    &--collapsible:not(&--open):not(&--disabled):hover {
      border-color: var(--neutrals-400);
      background: var(--neutrals-50);
      color: var(--neutrals-700);
    }
    &--collapsible:focus-within {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
      color: var(--primary-500);
    }
    &--collapsible.vc-search-bar__search--open {
      width: 180px;
      cursor: text;
    }
    // flex-grow would snap to the full row at once; only the width animates, so flex stays none
    &--collapsible.vc-search-bar__search--full.vc-search-bar__search--open {
      width: 100%;
    }
    &--collapsible.vc-search-bar__search--disabled {
      @apply tw-opacity-50;
    }
  }
  &__search-icon {
    color: var(--neutrals-400);
  }
  // covers the whole box, so the box itself is the click target
  &__search-btn {
    @apply tw-absolute tw-inset-0 tw-outline-none;
    border-radius: inherit;
    background: transparent;

    &:disabled {
      @apply tw-cursor-not-allowed;
    }
  }
}

@keyframes vc-search-bar-fade-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vc-search-bar__search--collapsible {
    transition: none;

    .vc-input {
      animation: none;
    }
  }
}
</style>
