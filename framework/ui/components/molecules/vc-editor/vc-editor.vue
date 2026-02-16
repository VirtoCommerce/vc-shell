<template>
  <div
    class="vc-editor"
    :class="{
      'vc-editor--error': !!errorMessage,
      'vc-editor--disabled': disabled,
      'vc-editor--focused': isFocused,
      'vc-editor--fullscreen': isFullscreen,
      'vc-editor--side-by-side': currentMode === 'split',
    }"
    :aria-label="label"
    :aria-invalid="!!errorMessage || undefined"
    :aria-disabled="disabled || undefined"
  >
    <VcLabel
      v-if="label && !isFullscreen"
      class="vc-editor__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
      :error="!!errorMessage"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <div
      v-if="editor"
      class="vc-editor__header"
    >
      <VcEditorToolbar
        v-if="currentMode === 'editor' || currentMode === 'split'"
        :editor="editor"
        :disabled="disabled"
        :content-type="detectedType"
        :toolbar="filteredToolbar"
        :custom-buttons="props.customButtons || []"
        @upload-image="triggerImageUpload"
      />

      <div class="vc-editor__header-actions">
        <VcEditorButton
          icon="lucide-eye"
          :active="currentMode === 'preview'"
          :disabled="disabled"
          @action="togglePreview"
        />
        <VcEditorButton
          icon="lucide-columns-2"
          :active="currentMode === 'split'"
          @action="toggleSideBySideView"
        />
        <VcEditorButton
          icon="lucide-code"
          :active="currentMode === 'source'"
          :disabled="disabled"
          @action="toggleSourceView"
        />
        <VcEditorButton
          :icon="isFullscreen ? 'lucide-shrink' : 'lucide-expand'"
          @action="isFullscreen = !isFullscreen"
        />
      </div>
    </div>

    <div class="vc-editor__body">
      <!-- Normal editor view -->
      <editor-content
        v-if="currentMode === 'editor'"
        :editor="editor"
        class="vc-editor__content"
      />

      <!-- Full preview view -->
      <div
        v-if="currentMode === 'preview'"
        class="vc-editor__preview ProseMirror"
        v-html="previewContent"
      />

      <!-- Source code view -->
      <textarea
        v-if="currentMode === 'source'"
        class="vc-editor__source ProseMirror"
        :value="formattedSource"
        :maxlength="maxlength"
        @input="handleSourceInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Side-by-side view: Editor left, Code right -->
      <div
        v-if="currentMode === 'split'"
        class="vc-editor__split-view"
      >
        <div class="vc-editor__split-editor">
          <editor-content
            :editor="editor"
            class="vc-editor__content"
          />
        </div>
        <div class="vc-editor__split-preview">
          <textarea
            class="vc-editor__source ProseMirror"
            :value="formattedSource"
            :maxlength="maxlength"
            @input="handleSourceInput"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
        </div>
      </div>
    </div>

    <!-- Character count display -->
    <div
      v-if="maxlength && (currentMode === 'source' || currentMode === 'split')"
      class="vc-editor__char-count"
      :class="{ 'vc-editor__char-count--warning': isNearLimit }"
    >
      {{ characterCount }} / {{ maxlength }}
    </div>

    <input
      ref="imageInput"
      type="file"
      hidden
      multiple
      accept="image/*"
      @change="handleImageSelection"
    />

    <slot
      v-if="errorMessage && !isFullscreen"
      name="error"
    >
      <VcHint class="vc-editor__error-hint">{{ errorMessage }}</VcHint>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Markdown } from "tiptap-markdown";
import { FontSize } from "./_internal/extensions/font-size";
import { format } from "prettier/standalone";
import * as prettierPluginHtml from "prettier/parser-html";
// eslint-disable-next-line import/no-named-as-default
import DOMPurify from "dompurify";
import { VcLabel, VcHint } from "../..";
import VcEditorToolbar from "./_internal/vc-editor-toolbar.vue";
import VcEditorButton from "./_internal/vc-editor-button.vue";
import type { CustomToolbarItem } from "./_internal/toolbar-types";

// Export types for external use
export type { CustomToolbarItem, CustomToolbarButton, CustomToolbarDropdown } from "./_internal/toolbar-types";

// Define toolbar button types
export type ToolbarNames =
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

export interface Props {
  placeholder?: string;
  modelValue?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  errorMessage?: string;
  assetsFolder?: string;
  multilanguage?: boolean;
  currentLanguage?: string;
  maxlength?: number;
  toolbar?: ToolbarNames[];
  extensions?: any[];
  customButtons?: CustomToolbarItem[];
}

export interface Emits {
  (event: "update:modelValue", value?: string): void;
  (event: "upload-image"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  disabled: false,
});

const emit = defineEmits<Emits>();

const isFocused = ref(false);
const isFullscreen = ref(false);
const imageInput = ref<HTMLInputElement | null>(null);
const detectedType = ref<"html" | "markdown">("markdown");

// Computed property for filtered toolbar based on props
const filteredToolbar = computed(() => {
  if (!props.toolbar) {
    // Default toolbar if none specified
    return [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "separator",
      "heading1",
      "heading2",
      "heading3",
      "separator",
      "bulletList",
      "orderedList",
      "blockquote",
      "separator",
      "link",
      "image",
      "table",
      "fontSize",
    ] as ToolbarNames[];
  }
  return props.toolbar;
});

// Character count for maxlength
const characterCount = computed(() => {
  return (props.modelValue || "").length;
});

const isNearLimit = computed(() => {
  if (!props.maxlength) return false;
  return characterCount.value > props.maxlength * 0.9;
});

// Function to detect content type
function detectContentType(content: string): "html" | "markdown" {
  if (!content || content.trim() === "") return "markdown";

  // HTML indicators
  const htmlPatterns = [
    /<[^>]+>/g, // HTML tags
    /&[a-zA-Z]+;/g, // HTML entities
  ];

  // Markdown indicators
  const markdownPatterns = [
    /^#{1,6}\s/m, // Headers
    /^\*\s/m, // Bullet lists
    /^\d+\.\s/m, // Numbered lists
    /\*\*[^*]+\*\*/g, // Bold
    /\*[^*]+\*/g, // Italic
    /\[[^\]]+\]\([^)]+\)/g, // Links
    /```[\s\S]*?```/g, // Code blocks
    /`[^`]+`/g, // Inline code
    /^>/m, // Blockquotes
  ];

  let htmlScore = 0;
  let markdownScore = 0;

  // Count HTML patterns
  htmlPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) htmlScore += matches.length;
  });

  // Count Markdown patterns
  markdownPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) markdownScore += matches.length;
  });

  // Only switch to HTML if there are significantly more HTML patterns
  if (htmlScore > markdownScore * 2) {
    return "html";
  }

  // Default to Markdown for most cases
  return "markdown";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extensions = computed(() => {
  const baseExtensions: any[] = [
    StarterKit,
    Underline,
    TextStyle,
    FontSize,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({ openOnClick: false }),
    Image,
    Placeholder.configure({ placeholder: props.placeholder }),
    Markdown.configure({
      html: true, // Allow HTML input/output
      tightLists: true, // No <p> inside <li> in markdown output
      tightListClass: "tight", // Add class to <ul> allowing you to remove <p> margins when tight
      bulletListMarker: "-", // <li> prefix in markdown output
      linkify: false, // Create links from "https://..." text
      breaks: true, // New lines (\n) in markdown input are converted to <br>
      transformPastedText: false, // Allow to paste markdown text in the editor
      transformCopiedText: false, // Copied text is transformed to markdown
    }),
  ];

  // Add custom extensions if provided
  if (props.extensions && props.extensions.length > 0) {
    baseExtensions.push(...props.extensions);
  }

  return baseExtensions;
});

const formattedSource = ref(props.modelValue || "");

watch(
  () => props.modelValue,
  async (value) => {
    // Detect content type
    detectedType.value = detectContentType(value || "");

    if (detectedType.value === "html") {
      try {
        formattedSource.value = await format(value || "", {
          parser: "html",
          plugins: [prettierPluginHtml],
          vueIndentScriptAndStyle: true,
        });
      } catch (e) {
        formattedSource.value = value || "";
      }
    } else {
      formattedSource.value = value || "";
    }
  },
  { immediate: true },
);

const previewContent = computed(() => {
  let htmlContent = "";

  if (detectedType.value === "markdown" && editor.value) {
    // Use Tiptap's built-in HTML conversion from Markdown
    htmlContent = editor.value.getHTML();
  } else {
    htmlContent = props.modelValue || "";
  }

  // Sanitize HTML to prevent XSS attacks
  return DOMPurify.sanitize(htmlContent, {
    // Allow safe HTML tags and attributes
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "div",
      "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "style", "colspan", "rowspan", "align", "valign"],
    // Remove dangerous protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    // Keep relative URLs
    KEEP_CONTENT: true,
    // Remove script tags and event handlers
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
});

// Single reactive state for editor mode
const editorMode = ref<"editor" | "preview" | "source" | "split">("editor");

// Computed property for current mode
const currentMode = computed(() => editorMode.value);

function togglePreview() {
  editorMode.value = editorMode.value === "preview" ? "editor" : "preview";
}

function toggleSourceView() {
  editorMode.value = editorMode.value === "source" ? "editor" : "source";
}

function toggleSideBySideView() {
  editorMode.value = editorMode.value === "split" ? "editor" : "split";
}

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: extensions.value,
  onUpdate: ({ editor: tipTapEditor }) => {
    // Always output in Markdown by default, unless HTML is detected
    const output =
      detectedType.value === "html"
        ? tipTapEditor.getHTML()
        : (tipTapEditor.storage as any).markdown?.getMarkdown?.() || tipTapEditor.getHTML();

    // Check maxlength if specified
    if (props.maxlength && output.length > props.maxlength) {
      return; // Don't emit if exceeds maxlength
    }

    emit("update:modelValue", output);
  },
  onFocus: () => {
    isFocused.value = true;
  },
  onBlur: () => {
    isFocused.value = false;
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;

    const editorContent =
      detectedType.value === "html"
        ? editor.value.getHTML()
        : (editor.value.storage as any).markdown?.getMarkdown?.() || editor.value.getHTML();

    if (editorContent !== value) {
      editor.value.commands.setContent(value || "");
    }
  },
);

watch(
  () => props.disabled,
  (isDisabled) => {
    editor.value?.setEditable(!isDisabled);
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function triggerImageUpload() {
  imageInput.value?.click();
}

function handleSourceInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  const value = target.value;

  // Check maxlength if specified
  if (props.maxlength && value.length > props.maxlength) {
    target.value = value.substring(0, props.maxlength);
    return;
  }

  emit("update:modelValue", value);
}

async function handleImageSelection(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length || !props.assetsFolder) return;

  const files = Array.from(target.files);
  const formData = new FormData();
  files.forEach((file) => formData.append("image", file));

  try {
    const result = await fetch(`/api/assets?folderUrl=/${props.assetsFolder}`, {
      method: "POST",
      body: formData,
    });
    const response = await result.json();

    response.forEach((item: { url: string }) => {
      if (item.url) {
        editor.value?.chain().focus().setImage({ src: item.url }).run();
      }
    });
  } catch (error) {
    console.error("Image upload failed:", error);
  }
}

</script>

<style lang="scss">
:root {
  // Editor color variables
  --vc-editor-border: var(--neutrals-300);
  --vc-editor-background: transparent;
  --vc-editor-surface: var(--additional-50);
  --vc-editor-text-primary: var(--neutrals-900);
  --vc-editor-text-secondary: var(--neutrals-500);
  --vc-editor-text-muted: var(--neutrals-400);
  --vc-editor-text-disabled: var(--neutrals-500);
  --vc-editor-background-disabled: var(--neutrals-200);
  --vc-editor-focus-border: var(--primary-500);
  --vc-editor-focus-shadow: var(--primary-500);
  --vc-editor-focus-ring-color: rgba(59, 130, 246, 0.3);
  --vc-editor-error-border: var(--danger-500);
  --vc-editor-error-text: var(--danger-500);
  --vc-editor-error-ring-color: rgba(239, 68, 68, 0.2);
  --vc-editor-table-header: var(--neutrals-100);
  --vc-editor-separator: var(--neutrals-200);
}

.vc-editor {
  display: flex;
  flex-direction: column;

  &__label {
    margin-bottom: 0.5rem;
  }

  &__header {
    display: flex;
    border: 1px solid var(--vc-editor-border);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background-color: var(--vc-editor-background);
    padding: 0.5rem;
  }

  &__source {
    font-family: monospace;
    resize: vertical;
  }

  &__header-actions {
    margin-left: auto;
    display: flex;
    gap: 0.25rem;
  }

  &__body {
    flex-grow: 1;
    display: flex;
  }

  &__content,
  &__preview {
    flex: 1;
  }

  &__split-view {
    display: flex;
    width: 100%;
    gap: 1px;
  }

  &__split-editor,
  &__split-preview {
    flex: 1;
  }

  &__split-editor .ProseMirror {
    border-radius: 0 0 0 6px;
    border-right: none;
  }

  &__split-preview .ProseMirror {
    border-radius: 0 0 6px 0;
    border-left: none;
  }

  &--side-by-side {
    .vc-editor__body {
      flex-direction: row;
    }
  }

  .ProseMirror {
    border: 1px solid var(--vc-editor-border);
    border-radius: 0 0 6px 6px;
    padding: 0.5rem 0.75rem;
    min-height: 20rem;
    outline: none;
    transition: border-color 0.2s;
    background-color: var(--vc-editor-surface);
    color: var(--vc-editor-text-primary);
    width: 100%;

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--vc-editor-text-muted);
      pointer-events: none;
      height: 0;
    }

    h1,
    h2,
    h3 {
      line-height: 1.1;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      font-weight: bold;
      color: var(--vc-editor-text-primary);
    }

    h1 {
      font-size: 2em;
      margin-top: 0.67em;
      margin-bottom: 0.67em;
    }

    h2 {
      font-size: 1.5em;
      margin-top: 0.83em;
      margin-bottom: 0.83em;
    }

    h3 {
      font-size: 1.17em;
      margin-top: 1em;
      margin-bottom: 1em;
    }

    ul,
    ol {
      padding: 0 1rem;
      list-style: disc;
    }

    ul {
      list-style: disc;
    }

    ol {
      list-style: decimal;
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid var(--vc-editor-separator);
      color: var(--vc-editor-text-secondary);
    }

    hr {
      border: none;
      border-top: 1px solid var(--vc-editor-separator);
      margin: 1rem 0;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }

    td,
    th {
      border: 1px solid var(--vc-editor-separator);
      padding: 0.5rem;
      text-align: left;
    }

    th {
      background-color: var(--vc-editor-table-header);
      font-weight: 600;
      color: var(--vc-editor-text-primary);
    }

    // Links
    a {
      color: var(--primary-600);
      text-decoration: underline;

      &:hover {
        color: var(--primary-700);
      }
    }

    // Code blocks
    pre {
      background-color: var(--vc-editor-background);
      border: 1px solid var(--vc-editor-border);
      border-radius: 6px;
      padding: 0.75rem;
      overflow-x: auto;
    }

    code {
      background-color: var(--vc-editor-background);
      color: var(--vc-editor-text-primary);
      padding: 0.125rem 0.25rem;
      border-radius: 2px;
      font-size: 0.875em;
    }
  }

  &--focused .ProseMirror {
    border-color: var(--vc-editor-focus-border);
    box-shadow: 0 0 0 3px var(--vc-editor-focus-ring-color);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--disabled .ProseMirror {
    background-color: var(--vc-editor-background-disabled);
    cursor: not-allowed;
    color: var(--vc-editor-text-disabled);
  }

  &--error .ProseMirror {
    border-color: var(--vc-editor-error-border);
    box-shadow: 0 0 0 3px var(--vc-editor-error-ring-color);
  }

  &__error-hint {
    color: var(--vc-editor-error-text);
    margin-top: 0.25rem;
  }

  &__char-count {
    font-size: 0.75rem;
    color: var(--vc-editor-text-secondary);
    text-align: right;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--vc-editor-border);
    border-top: none;
    border-radius: 0 0 6px 6px;
    background-color: var(--vc-editor-background);

    &--warning {
      color: var(--warning-600);
      font-weight: 600;
    }
  }

  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--vc-editor-surface);
    z-index: 1000;
    padding: 1rem;
    display: flex;
    flex-direction: column;

    .vc-editor__body {
      height: 100%;
    }

    .ProseMirror {
      height: 100%;
      min-height: 0;
    }
  }
}
</style>
