<template>
  <div class="vc-editor-font-selector">
    <!-- Font Size Dropdown -->
    <div class="vc-editor-font-selector__dropdown">
      <button
        type="button"
        class="vc-editor-font-selector__button"
        :disabled="disabled"
        @click="toggleSizeDropdown"
      >
        <VcIcon icon="lucide-a-large-small" size="s" :use-container="false" />
        <span v-if="currentFontSize" class="vc-editor-font-selector__size-value">{{ currentFontSize }}px</span>
        <VcIcon icon="lucide-chevron-down" size="xs" :use-container="false" />
      </button>
      <div
        v-if="showSizeDropdown"
        class="vc-editor-font-selector__menu"
        @click.stop
      >
        <div
          v-for="size in fontSizes"
          :key="size"
          class="vc-editor-font-selector__option"
          :class="{ 'vc-editor-font-selector__option--active': currentFontSize === size }"
          @click="selectFontSize(size)"
        >
          {{ size }}px
        </div>
        <div class="vc-editor-font-selector__custom">
          <input
            v-model="customSize"
            type="number"
            min="8"
            max="72"
            placeholder="Custom"
            class="vc-editor-font-selector__input"
            @keydown.enter="selectCustomFontSize"
            @blur="selectCustomFontSize"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Editor } from "@tiptap/vue-3";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { VcIcon } from "@ui/components/atoms";

interface Props {
  editor: Editor;
  disabled: boolean;
}

const props = defineProps<Props>();

const showSizeDropdown = ref(false);
const customSize = ref<number | null>(null);

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const currentFontSize = computed(() => {
  const attrs = props.editor.getAttributes('textStyle');
  return attrs.fontSize ? parseInt(attrs.fontSize.replace('px', '')) : null;
});

function toggleSizeDropdown() {
  showSizeDropdown.value = !showSizeDropdown.value;
}

function selectFontSize(size: number) {
  props.editor.chain().focus().setFontSize(`${size}px`).run();
  showSizeDropdown.value = false;
}

function selectCustomFontSize() {
  if (customSize.value && customSize.value >= 8 && customSize.value <= 72) {
    props.editor.chain().focus().setFontSize(`${customSize.value}px`).run();
    customSize.value = null;
    showSizeDropdown.value = false;
  }
}

function closeDropdown() {
  showSizeDropdown.value = false;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.vc-editor-font-selector')) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss">
.vc-editor-font-selector {
  display: flex;
  gap: 0.25rem;

  &__dropdown {
    position: relative;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    height: 2rem;
    padding: 0 0.5rem;
    border: none;
    border-radius: 6px;
    background-color: transparent;
    color: var(--neutrals-600);
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      transform 0.1s ease;

    &:hover:not(:disabled) {
      background-color: var(--neutrals-100);
      color: var(--neutrals-800);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      color: var(--neutrals-400);
      cursor: not-allowed;
      opacity: 0.5;
      transform: none;
    }

    &:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 2px;
    }
  }

  &__size-value {
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 2rem;
    text-align: center;
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 100;
    min-width: 160px;
    max-height: 240px;
    overflow-y: auto;
    background: white;
    border: 1px solid var(--neutrals-300);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-top: 0.25rem;
  }

  &__option {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    border-bottom: 1px solid var(--neutrals-100);
    transition: background-color 0.15s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--neutrals-50);
    }

    &--active {
      background-color: var(--primary-100);
      color: var(--primary-700);
      font-weight: 500;
    }
  }

  &__custom {
    padding: 0.5rem 0.75rem;
    border-top: 1px solid var(--neutrals-200);
  }

  &__input {
    width: 100%;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--neutrals-300);
    border-radius: 4px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: var(--primary-500);
    }
  }
}
</style>