<template>
  <div class="vc-editor-toolbar">
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
        :active="editor.isActive('bold')"
        :disabled="!editor.can().toggleBold() || disabled"
        @action="editor.chain().focus().toggleBold().run()"
      />

      <!-- Italic -->
      <VcEditorButton
        v-else-if="item === 'italic'"
        icon="lucide-italic"
        :active="editor.isActive('italic')"
        :disabled="!editor.can().toggleItalic() || disabled"
        @action="editor.chain().focus().toggleItalic().run()"
      />

      <!-- Underline -->
      <VcEditorButton
        v-else-if="item === 'underline'"
        icon="lucide-underline"
        :active="editor.isActive('underline')"
        :disabled="!editor.can().toggleUnderline() || disabled"
        @action="editor.chain().focus().toggleUnderline().run()"
      />

      <!-- Strikethrough -->
      <VcEditorButton
        v-else-if="item === 'strikethrough'"
        icon="lucide-strikethrough"
        :active="editor.isActive('strike')"
        :disabled="!editor.can().toggleStrike() || disabled"
        @action="editor.chain().focus().toggleStrike().run()"
      />

      <!-- Heading 1 -->
      <VcEditorButton
        v-else-if="item === 'heading1'"
        icon="lucide-heading-1"
        :active="editor.isActive('heading', { level: 1 })"
        :disabled="!editor.can().toggleHeading({ level: 1 }) || disabled"
        @action="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      />

      <!-- Heading 2 -->
      <VcEditorButton
        v-else-if="item === 'heading2'"
        icon="lucide-heading-2"
        :active="editor.isActive('heading', { level: 2 })"
        :disabled="!editor.can().toggleHeading({ level: 2 }) || disabled"
        @action="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />

      <!-- Heading 3 -->
      <VcEditorButton
        v-else-if="item === 'heading3'"
        icon="lucide-heading-3"
        :active="editor.isActive('heading', { level: 3 })"
        :disabled="!editor.can().toggleHeading({ level: 3 }) || disabled"
        @action="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      />

      <!-- Bullet List -->
      <VcEditorButton
        v-else-if="item === 'bulletList'"
        icon="lucide-list"
        :active="editor.isActive('bulletList')"
        :disabled="!editor.can().toggleBulletList() || disabled"
        @action="editor.chain().focus().toggleBulletList().run()"
      />

      <!-- Ordered List -->
      <VcEditorButton
        v-else-if="item === 'orderedList'"
        icon="lucide-list-ordered"
        :active="editor.isActive('orderedList')"
        :disabled="!editor.can().toggleOrderedList() || disabled"
        @action="editor.chain().focus().toggleOrderedList().run()"
      />

      <!-- Blockquote -->
      <VcEditorButton
        v-else-if="item === 'blockquote'"
        icon="lucide-quote"
        :active="editor.isActive('blockquote')"
        :disabled="!editor.can().toggleBlockquote() || disabled"
        @action="editor.chain().focus().toggleBlockquote().run()"
      />

      <!-- Link -->
      <VcEditorButton
        v-else-if="item === 'link'"
        icon="lucide-link"
        :active="editor.isActive('link')"
        :disabled="disabled"
        @action="setLink"
      />

      <!-- Image -->
      <VcEditorButton
        v-else-if="item === 'image'"
        icon="lucide-image"
        :disabled="disabled"
        @action="triggerImageUpload"
      />

      <!-- Table -->
      <VcEditorButton
        v-else-if="item === 'table'"
        icon="lucide-table"
        :disabled="disabled"
        @action="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
      />
    </template>

    <!-- Table controls (always show when table is active) -->
    <template v-if="editor.isActive('table')">
      <div class="vc-editor-toolbar__separator" />
      <VcEditorButton
        icon="lucide-delete"
        :disabled="disabled"
        @action="editor.chain().focus().deleteTable().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-left-from-line"
        :disabled="disabled"
        @action="editor.chain().focus().addColumnBefore().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-right-from-line"
        :disabled="disabled"
        @action="editor.chain().focus().addColumnAfter().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-up-from-line"
        :disabled="disabled"
        @action="editor.chain().focus().addRowBefore().run()"
      />
      <VcEditorButton
        icon="lucide-arrow-down-from-line"
        :disabled="disabled"
        @action="editor.chain().focus().addRowAfter().run()"
      />
      <VcEditorButton
        icon="lucide-trash-2"
        :disabled="disabled"
        @action="editor.chain().focus().deleteColumn().run()"
      />
      <VcEditorButton
        icon="lucide-trash"
        :disabled="disabled"
        @action="editor.chain().focus().deleteRow().run()"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Editor } from "@tiptap/vue-3";
import { computed } from "vue";
import VcEditorButton from "./vc-editor-button.vue";

export interface Props {
  editor: Editor;
  disabled: boolean;
  contentType: "html" | "markdown";
  toolbar: ToolbarNames[];
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
  | "separator";

const props = withDefaults(defineProps<Props>(), {
  contentType: "html",
});

const emit = defineEmits(["uploadImage"]);

// Computed property to get toolbar items
const toolbarItems = computed(() => {
  return props.toolbar || [];
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
  --vc-toolbar-separator: var(--neutrals-300);
}

.vc-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--vc-toolbar-bg);
  border-radius: 4px 4px 0 0;

  &__separator {
    width: 1px;
    height: 1.5rem;
    background-color: var(--vc-toolbar-separator);
    margin: 0 0.5rem;
    flex-shrink: 0;
  }
}
</style>
