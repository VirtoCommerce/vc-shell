<template>
  <button
    type="button"
    class="vc-editor-button"
    :class="{ 'vc-editor-button--active': active }"
    :disabled="disabled"
    @click="$emit('action')"
  >
    <VcIcon
      :icon="icon"
      size="s"
      :use-container="false"
    />
  </button>
</template>

<script lang="ts" setup>
import { VcIcon } from "../../../atoms";

defineProps({
  icon: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["action"]);
</script>

<style lang="scss">
:root {
  // Button color variables
  --vc-button-text: var(--neutrals-600);
  --vc-button-text-hover: var(--neutrals-800);
  --vc-button-text-active: var(--primary-600);
  --vc-button-text-disabled: var(--neutrals-400);
  --vc-button-bg: transparent;
  --vc-button-bg-hover: var(--neutrals-100);
  --vc-button-bg-active: var(--primary-100);
  --vc-button-bg-disabled: transparent;
  --vc-button-border-radius: 6px;
}

.vc-editor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--vc-button-border-radius);
  background-color: var(--vc-button-bg);
  color: var(--vc-button-text);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease;

  &:hover:not(:disabled) {
    background-color: var(--vc-button-bg-hover);
    color: var(--vc-button-text-hover);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &--active {
    background-color: var(--vc-button-bg-active);
    color: var(--vc-button-text-active);
    font-weight: 600;

    &:hover {
      background-color: var(--primary-200);
      color: var(--primary-700);
    }
  }

  &:disabled {
    color: var(--vc-button-text-disabled);
    background-color: var(--vc-button-bg-disabled);
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  // Focus styles for accessibility
  &:focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }
}
</style>
