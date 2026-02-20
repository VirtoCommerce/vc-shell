<template>
  <div
    class="vc-editor-toolbar"
    role="toolbar"
    aria-label="Text formatting"
  >
    <!-- Render buttons based on toolbar prop -->
    <template
      v-for="(item, index) in toolbarItems"
      :key="index"
    >
      <!-- Separator -->
      <div
        v-if="item === 'separator'"
        class="vc-editor-toolbar__separator"
      />

      <!-- Bold -->
      <VcEditorButton
        v-else-if="item === 'bold'"
        icon="lucide-bold"
        aria-label="Bold"
        :active="editor.isActive('bold')"
        :disabled="!editor.can().toggleBold() || disabled"
        @action="editor.chain().focus().toggleBold().run()"
      />

      <!-- Italic -->
      <VcEditorButton
        v-else-if="item === 'italic'"
        icon="lucide-italic"
        aria-label="Italic"
        :active="editor.isActive('italic')"
        :disabled="!editor.can().toggleItalic() || disabled"
        @action="editor.chain().focus().toggleItalic().run()"
      />

      <!-- Underline -->
      <VcEditorButton
        v-else-if="item === 'underline'"
        icon="lucide-underline"
        aria-label="Underline"
        :active="editor.isActive('underline')"
        :disabled="!editor.can().toggleUnderline() || disabled"
        @action="editor.chain().focus().toggleUnderline().run()"
      />

      <!-- Strikethrough -->
      <VcEditorButton
        v-else-if="item === 'strikethrough'"
        icon="lucide-strikethrough"
        aria-label="Strikethrough"
        :active="editor.isActive('strike')"
        :disabled="!editor.can().toggleStrike() || disabled"
        @action="editor.chain().focus().toggleStrike().run()"
      />

      <!-- Heading 1 -->
      <VcEditorButton
        v-else-if="item === 'heading1'"
        icon="lucide-heading-1"
        aria-label="Heading 1"
        :active="editor.isActive('heading', { level: 1 })"
        :disabled="!editor.can().toggleHeading({ level: 1 }) || disabled"
        @action="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      />

      <!-- Heading 2 -->
      <VcEditorButton
        v-else-if="item === 'heading2'"
        icon="lucide-heading-2"
        aria-label="Heading 2"
        :active="editor.isActive('heading', { level: 2 })"
        :disabled="!editor.can().toggleHeading({ level: 2 }) || disabled"
        @action="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />

      <!-- Heading 3 -->
      <VcEditorButton
        v-else-if="item === 'heading3'"
        icon="lucide-heading-3"
        aria-label="Heading 3"
        :active="editor.isActive('heading', { level: 3 })"
        :disabled="!editor.can().toggleHeading({ level: 3 }) || disabled"
        @action="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      />

      <!-- Bullet List -->
      <VcEditorButton
        v-else-if="item === 'bulletList'"
        icon="lucide-list"
        aria-label="Bullet list"
        :active="editor.isActive('bulletList')"
        :disabled="!editor.can().toggleBulletList() || disabled"
        @action="editor.chain().focus().toggleBulletList().run()"
      />

      <!-- Ordered List -->
      <VcEditorButton
        v-else-if="item === 'orderedList'"
        icon="lucide-list-ordered"
        aria-label="Numbered list"
        :active="editor.isActive('orderedList')"
        :disabled="!editor.can().toggleOrderedList() || disabled"
        @action="editor.chain().focus().toggleOrderedList().run()"
      />

      <!-- Blockquote -->
      <VcEditorButton
        v-else-if="item === 'blockquote'"
        icon="lucide-quote"
        aria-label="Blockquote"
        :active="editor.isActive('blockquote')"
        :disabled="!editor.can().toggleBlockquote() || disabled"
        @action="editor.chain().focus().toggleBlockquote().run()"
      />

      <!-- Link -->
      <VcEditorButton
        v-else-if="item === 'link'"
        icon="lucide-link"
        aria-label="Insert link"
        :active="editor.isActive('link')"
        :disabled="disabled"
        @action="setLink"
      />

      <!-- Image -->
      <VcEditorButton
        v-else-if="item === 'image'"
        icon="lucide-image"
        aria-label="Insert image"
        :disabled="disabled"
        @action="triggerImageUpload"
      />

      <!-- Table -->
      <VcEditorButton
        v-else-if="item === 'table'"
        icon="lucide-table"
        aria-label="Insert table"
        :disabled="disabled"
        @action="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
      />

      <!-- Font Selector -->
      <VcEditorFontSelector
        v-else-if="item === 'fontSize'"
        :editor="editor"
        :disabled="disabled"
      />
    </template>

    <!-- Custom buttons -->
    <template v-if="props.customButtons.length > 0">
      <div class="vc-editor-toolbar__separator" />
      <VcEditorCustomButton
        v-for="customButton in sortedCustomButtons"
        :key="customButton.id"
        :editor="editor"
        :custom-button="customButton"
        :disabled="disabled"
      />
    </template>

    <!-- Table controls (always show when table is active) -->
    <template v-if="editor.isActive('table')">
      <div class="vc-editor-toolbar__separator" />
      <VcEditorButton
        icon="lucide-delete"
        aria-label="Delete table"
        :disabled="disabled"
        @action="editor.chain().focus().deleteTable().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-left-from-line"
        aria-label="Add column before"
        :disabled="disabled"
        @action="editor.chain().focus().addColumnBefore().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-right-from-line"
        aria-label="Add column after"
        :disabled="disabled"
        @action="editor.chain().focus().addColumnAfter().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-up-from-line"
        aria-label="Add row before"
        :disabled="disabled"
        @action="editor.chain().focus().addRowBefore().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-down-from-line"
        aria-label="Add row after"
        :disabled="disabled"
        @action="editor.chain().focus().addRowAfter().run()"
      />
      <VcEditorButton
        icon="lucide-trash-2"
        aria-label="Delete column"
        :disabled="disabled"
        @action="editor.chain().focus().deleteColumn().run()"
      />
      <VcEditorButton
        icon="lucide-trash"
        aria-label="Delete row"
        :disabled="disabled"
        @action="editor.chain().focus().deleteRow().run()"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Editor } from "@tiptap/vue-3";
import { computed } from "vue";
import VcEditorButton from "@ui/components/molecules/vc-editor/_internal/vc-editor-button.vue";
import VcEditorCustomButton from "@ui/components/molecules/vc-editor/_internal/vc-editor-custom-button.vue";
import VcEditorFontSelector from "@ui/components/molecules/vc-editor/_internal/vc-editor-font-selector.vue";
import type { CustomToolbarItem } from "@ui/components/molecules/vc-editor/_internal/toolbar-types";

export interface Props {
  editor: Editor;
  disabled: boolean;
  contentType: "html" | "markdown";
  toolbar: ToolbarNames[];
  customButtons: CustomToolbarItem[];
}

// Define toolbar button types
type ToolbarNames =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "link"
  | "image"
  | "table"
  | "fontSize"
  | "separator";

const props = withDefaults(defineProps<Props>(), {
  contentType: "html",
  customButtons: () => [],
});

const emit = defineEmits(["uploadImage"]);

// Computed property to get toolbar items
const toolbarItems = computed(() => {
  return props.toolbar || [];
});

// Computed property to sort custom buttons
const sortedCustomButtons = computed(() => {
  return [...props.customButtons].sort((a, b) => {
    const groupA = a.group || 'default';
    const groupB = b.group || 'default';
    const orderA = a.order || 0;
    const orderB = b.order || 0;

    if (groupA !== groupB) {
      return groupA.localeCompare(groupB);
    }

    return orderA - orderB;
  });
});

function setLink() {
  const previousUrl = props.editor.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  if (url === null) return;
  if (url === "") {
    props.editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  props.editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

function triggerImageUpload() {
  emit("uploadImage");
}
</script>

<style lang="scss">
:root {
  // Toolbar color variables
  --vc-toolbar-bg: var(--neutrals-50);
  --vc-toolbar-separator: var(--neutrals-200);
}

.vc-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;

  &__separator {
    width: 1px;
    height: 1.5rem;
    background-color: var(--vc-toolbar-separator);
    margin: 0 0.5rem;
    flex-shrink: 0;
  }

}
</style>
