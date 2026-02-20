<template>
  <component
    v-if="isButton(customButton) && customButton.component"
    :is="customButton.component"
    :editor="editor"
    :disabled="disabled || isDisabled"
    v-bind="customButton.componentProps || {}"
  />
  <VcEditorButton
    v-else-if="isButton(customButton)"
    :icon="customButton.icon"
    :active="isActive"
    :disabled="disabled || isDisabled"
    @action="handleAction"
  />
  <div
    v-else-if="isDropdown(customButton)"
    class="vc-editor-dropdown"
  >
    <select
      :disabled="disabled || isDisabled"
      @change="handleDropdownChange"
    >
      <option
        v-for="option in customButton.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import type { Editor } from "@tiptap/vue-3";
import { computed } from "vue";
import VcEditorButton from "@ui/components/molecules/vc-editor/_internal/vc-editor-button.vue";
import type { CustomToolbarItem } from "@ui/components/molecules/vc-editor/_internal/toolbar-types";
import { isButton, isDropdown } from "@ui/components/molecules/vc-editor/_internal/toolbar-types";

interface Props {
  editor: Editor;
  customButton: CustomToolbarItem;
  disabled: boolean;
}

const props = defineProps<Props>();

const isActive = computed(() => {
  if (isButton(props.customButton) && props.customButton.isActive) {
    return props.customButton.isActive(props.editor);
  }
  return false;
});

const isDisabled = computed(() => {
  if (props.customButton.isDisabled) {
    return props.customButton.isDisabled(props.editor);
  }
  return false;
});

function handleAction() {
  if (isButton(props.customButton)) {
    props.customButton.action(props.editor);
  }
}

function handleDropdownChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  if (isDropdown(props.customButton)) {
    const option = props.customButton.options.find(opt => opt.value === target.value);
    if (option) {
      option.action(props.editor, target.value);
    }
  }
}
</script>