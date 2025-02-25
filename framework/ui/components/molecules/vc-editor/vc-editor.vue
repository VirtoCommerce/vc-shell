<template>
  <div
    class="vc-editor"
    :class="{
      'vc-editor--error': errorMessage,
      'vc-editor--disabled': disabled,
    }"
  >
    <!-- Editor label -->
    <VcLabel
      v-if="label"
      class="vc-editor__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        {{ tooltip }}
      </template>
    </VcLabel>

    <!-- Editor field -->
    <md-editor
      ref="editorRef"
      v-model="model"
      language="any"
      :editor-id="id"
      :disabled="disabled"
      :read-only="disabled"
      :sanitize="sanitize"
      :placeholder="placeholder"
      :toolbars="toolbars"
      no-katex
      no-mermaid
      class="vc-editor__editor"
      @on-upload-img="onUploadImage"
    />

    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-editor__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, getCurrentInstance, Ref, computed, ComputedRef } from "vue";
import DOMPurify from "dompurify";
import { VcLabel, VcHint } from "../..";
import { MdEditor, ToolbarNames, config } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { useI18n } from "vue-i18n";
import { reactiveComputed } from "@vueuse/core";
import { tags } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

export interface Props {
  placeholder?: string;
  modelValue?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  errorMessage?: string;
  assetsFolder: string;
  multilanguage?: boolean;
  currentLanguage?: string;
  maxlength?: number;
  toolbar?: ToolbarNames[];
}

export interface Emits {
  (event: "update:modelValue", value: string | number | Date | null | undefined): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const uid = getCurrentInstance()?.uid;
const id = `editor-${uid}`;

const editorRef = ref(null) as Ref<typeof MdEditor | null>;
defineSlots<{
  error?: (props: any) => any;
}>();

const tagColors = [
  { tag: tags.comment, color: "var(--neutrals-500)" },
  { tag: tags.lineComment, color: "var(--neutrals-500)" },
  { tag: tags.blockComment, color: "var(--neutrals-500)" },
  { tag: tags.docComment, color: "var(--neutrals-500)" },

  { tag: tags.name, color: "var(--primary-500)" },
  { tag: tags.variableName, color: "var(--primary-500)" },
  { tag: tags.propertyName, color: "var(--primary-500)" },
  { tag: tags.labelName, color: "var(--primary-500)" },

  { tag: tags.typeName, color: "var(--secondary-500)" },
  { tag: tags.tagName, color: "var(--secondary-600)" },
  { tag: tags.namespace, color: "var(--secondary-700)" },

  { tag: tags.attributeName, color: "var(--primary-600)" },
  { tag: tags.className, color: "var(--primary-700)" },

  { tag: tags.macroName, color: "var(--accent-500)" },

  { tag: tags.literal, color: "var(--info-500)" },
  { tag: tags.string, color: "var(--success-500)" },
  { tag: tags.docString, color: "var(--success-400)" },
  { tag: tags.character, color: "var(--success-300)" },
  { tag: tags.attributeValue, color: "var(--success-300)" },

  { tag: tags.number, color: "var(--info-500)" },
  { tag: tags.integer, color: "var(--info-500)" },
  { tag: tags.float, color: "var(--info-500)" },

  { tag: tags.bool, color: "var(--warning-500)" },
  { tag: tags.atom, color: "var(--warning-500)" },
  { tag: tags.unit, color: "var(--warning-500)" },

  { tag: tags.regexp, color: "var(--accent-600)" },
  { tag: tags.escape, color: "var(--accent-500)" },
  { tag: tags.color, color: "var(--accent-500)" },
  { tag: tags.url, color: "var(--accent-500)" },

  { tag: tags.keyword, color: "var(--primary-700)" },
  { tag: tags.self, color: "var(--primary-700)" },
  { tag: tags.operatorKeyword, color: "var(--primary-700)" },
  { tag: tags.controlKeyword, color: "var(--primary-700)" },
  { tag: tags.definitionKeyword, color: "var(--primary-700)" },
  { tag: tags.moduleKeyword, color: "var(--primary-700)" },

  { tag: tags.null, color: "var(--warning-600)" },

  { tag: tags.operator, color: "var(--primary-500)" },
  { tag: tags.derefOperator, color: "var(--primary-500)" },
  { tag: tags.arithmeticOperator, color: "var(--primary-500)" },
  { tag: tags.logicOperator, color: "var(--primary-500)" },
  { tag: tags.bitwiseOperator, color: "var(--primary-500)" },
  { tag: tags.compareOperator, color: "var(--primary-500)" },
  { tag: tags.updateOperator, color: "var(--primary-500)" },
  { tag: tags.definitionOperator, color: "var(--primary-500)" },
  { tag: tags.typeOperator, color: "var(--primary-500)" },
  { tag: tags.controlOperator, color: "var(--primary-500)" },

  { tag: tags.punctuation, color: "var(--neutrals-700)" },
  { tag: tags.separator, color: "var(--neutrals-700)" },
  { tag: tags.bracket, color: "var(--neutrals-700)" },
  { tag: tags.angleBracket, color: "var(--neutrals-700)" },
  { tag: tags.squareBracket, color: "var(--neutrals-700)" },
  { tag: tags.paren, color: "var(--neutrals-700)" },
  { tag: tags.brace, color: "var(--neutrals-700)" },

  { tag: tags.content, color: "var(--neutrals-900)" },

  { tag: tags.heading, color: "var(--primary-700)" },
  { tag: tags.heading1, color: "var(--primary-800)" },
  { tag: tags.heading2, color: "var(--primary-700)" },
  { tag: tags.heading3, color: "var(--primary-600)" },
  { tag: tags.heading4, color: "var(--primary-500)" },
  { tag: tags.heading5, color: "var(--primary-400)" },
  { tag: tags.heading6, color: "var(--primary-300)" },

  { tag: tags.contentSeparator, color: "var(--neutrals-300)" },

  { tag: tags.list, color: "var(--neutrals-900)" },
  { tag: tags.quote, color: "var(--neutrals-700)" },

  { tag: tags.emphasis, color: "var(--primary-500)" },
  { tag: tags.strong, color: "var(--primary-700)" },

  { tag: tags.link, color: "var(--accent-500)" },

  { tag: tags.monospace, color: "var(--neutrals-900)" },

  { tag: tags.strikethrough, color: "var(--danger-500)" },

  { tag: tags.inserted, color: "var(--success-500)" },
  { tag: tags.deleted, color: "var(--danger-500)" },
  { tag: tags.changed, color: "var(--warning-500)" },

  { tag: tags.invalid, color: "var(--danger-700)" },

  { tag: tags.meta, color: "var(--neutrals-600)" },
  { tag: tags.documentMeta, color: "var(--neutrals-600)" },
  { tag: tags.annotation, color: "var(--neutrals-600)" },
  { tag: tags.processingInstruction, color: "var(--neutrals-600)" },
];

const myHighlightStyle = HighlightStyle.define(tagColors);

const toolbars: ComputedRef<ToolbarNames[]> = computed(() =>
  props.disabled
    ? []
    : props.toolbar
      ? props.toolbar
      : [
          "bold",
          "underline",
          "italic",
          "-",
          "title",
          "strikeThrough",
          "quote",
          "unorderedList",
          "orderedList",
          "-",
          "link",
          "image",
          "table",
          "-",
          "revoke",
          "next",
          "-",
          "pageFullscreen",
          "fullscreen",
          "preview",
          "previewOnly",
        ],
);

config({
  codeMirrorExtensions: (theme, extensions) => {
    return [syntaxHighlighting(myHighlightStyle), ...extensions];
  },
  editorConfig: {
    languageUserDefined: {
      any: reactiveComputed(() => ({
        toolbarTips: {
          bold: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.BOLD"),
          underline: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.UNDERLINE"),
          italic: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.ITALIC"),
          strikeThrough: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.STRIKE_THROUGH"),
          title: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.TITLE"),
          sub: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.SUB"),
          sup: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.SUP"),
          quote: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.QUOTE"),
          unorderedList: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.UNORDERED_LIST"),
          orderedList: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.ORDERED_LIST"),
          task: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.TASK"),
          codeRow: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.CODE_ROW"),
          code: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.CODE"),
          link: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.LINK"),
          image: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.IMAGE"),
          table: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.TABLE"),
          mermaid: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.MERMAID"),
          katex: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.KATEX"),
          revoke: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.REVOKE"),
          next: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.NEXT"),
          save: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.SAVE"),
          prettier: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.PRETTIER"),
          pageFullscreen: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.PAGE_FULLSCREEN"),
          fullscreen: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.FULLSCREEN"),
          preview: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.PREVIEW"),
          previewOnly: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.PREVIEW_ONLY"),
          htmlPreview: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.HTML_PREVIEW"),
          catalog: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.CATALOG"),
          github: t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.GITHUB"),
          "-": t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.DASH"),
          "=": t("COMPONENTS.MOLECULES.VC_EDITOR.TOOLBAR_TIPS.EQUALS"),
        },
        titleItem: {
          h1: t("COMPONENTS.MOLECULES.VC_EDITOR.TITLE_ITEM.H1"),
          h2: t("COMPONENTS.MOLECULES.VC_EDITOR.TITLE_ITEM.H2"),
          h3: t("COMPONENTS.MOLECULES.VC_EDITOR.TITLE_ITEM.H3"),
          h4: t("COMPONENTS.MOLECULES.VC_EDITOR.TITLE_ITEM.H4"),
          h5: t("COMPONENTS.MOLECULES.VC_EDITOR.TITLE_ITEM.H5"),
          h6: t("COMPONENTS.MOLECULES.VC_EDITOR.TITLE_ITEM.H6"),
        },
        imgTitleItem: {
          link: t("COMPONENTS.MOLECULES.VC_EDITOR.IMG_TITLE_ITEM.LINK"),
          upload: t("COMPONENTS.MOLECULES.VC_EDITOR.IMG_TITLE_ITEM.UPLOAD"),
          clip2upload: t("COMPONENTS.MOLECULES.VC_EDITOR.IMG_TITLE_ITEM.CLIP2UPLOAD"),
        },
        linkModalTips: {
          linkTitle: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.LINK_TITLE"),
          imageTitle: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.IMAGE_TITLE"),
          descLabel: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.DESC_LABEL"),
          descLabelPlaceHolder: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.DESC_LABEL_PLACEHOLDER"),
          urlLabel: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.URL_LABEL"),
          urlLabelPlaceHolder: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.URL_LABEL_PLACEHOLDER"),
          buttonOK: t("COMPONENTS.MOLECULES.VC_EDITOR.LINK_MODAL_TIPS.BUTTON_OK"),
        },
        clipModalTips: {
          title: t("COMPONENTS.MOLECULES.VC_EDITOR.CLIP_MODAL_TIPS.TITLE"),
          buttonUpload: t("COMPONENTS.MOLECULES.VC_EDITOR.CLIP_MODAL_TIPS.BUTTON_UPLOAD"),
        },
        copyCode: {
          text: t("COMPONENTS.MOLECULES.VC_EDITOR.COPY_CODE.TEXT"),
          successTips: t("COMPONENTS.MOLECULES.VC_EDITOR.COPY_CODE.SUCCESS_TIPS"),
          failTips: t("COMPONENTS.MOLECULES.VC_EDITOR.COPY_CODE.FAIL_TIPS"),
        },
        mermaid: {
          flow: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.FLOW"),
          sequence: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.SEQUENCE"),
          gantt: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.GANTT"),
          class: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.CLASS"),
          state: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.STATE"),
          pie: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.PIE"),
          relationship: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.RELATIONSHIP"),
          journey: t("COMPONENTS.MOLECULES.VC_EDITOR.MERMAID.JOURNEY"),
        },
        katex: {
          inline: t("COMPONENTS.MOLECULES.VC_EDITOR.KATEX.INLINE"),
          block: t("COMPONENTS.MOLECULES.VC_EDITOR.KATEX.BLOCK"),
        },
        footer: {
          markdownTotal: t("COMPONENTS.MOLECULES.VC_EDITOR.FOOTER.MARKDOWN_TOTAL"),
          scrollAuto: t("COMPONENTS.MOLECULES.VC_EDITOR.FOOTER.SCROLL_AUTO"),
        },
      })),
    },
  },
});

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

async function onUploadImage(files: File[], callback: (urls: string[]) => void) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("image", file);
  });

  const result = await fetch(`/api/assets?folderUrl=/${props.assetsFolder}`, {
    method: "POST",
    body: formData,
  });

  console.log(result);

  const response = await result.json();

  callback(
    response.map((item: any) => ({
      url: item.url,
      alt: item.name,
      title: item.name,
    })),
  );
}

function sanitize(html: string) {
  return DOMPurify.sanitize(html);
}

defineExpose({
  editorRef,
});
</script>

<style lang="scss">
:root {
  --editor-border-radius: 3px;
  --editor-border-color: var(--secondary-200);
  --editor-border-color-error: var(--base-error-color, var(--danger-500));
  --editor-disabled-bg: var(--neutrals-50);
  --editor-disabled-text: var(--neutrals-400);
  --editor-placeholder-color: var(--neutrals-400);
}

.vc-editor {
  @apply tw-flex tw-flex-col;

  &--error {
    .md-editor {
      @apply tw-border-[color:var(--editor-border-color-error)];
    }
  }

  &__label {
    @apply tw-mb-2;
  }

  &__error {
    @apply tw-text-[color:var(--editor-border-color-error)] tw-mt-1;
  }
}

.md-editor {
  --md-color: var(--secondary-800);
  --md-hover-color: var(--additional-950);
  --md-bk-color: var(--additional-50);
  --md-bk-color-outstand: var(--neutrals-100);
  --md-bk-hover-color: var(--secondary-50);
  --md-border-color: var(--base-border-color, var(--neutrals-200));
  --md-border-hover-color: var(--neutrals-400);
  --md-border-active-color: var(--neutrals-400);
  --md-modal-mask: rgba(0, 0, 0, 0.45);
  --md-modal-shadow: 0px 6px 24px 2px rgba(0, 0, 0, 0.1);
  --md-scrollbar-bg-color: var(--base-border-color, var(--neutrals-200));
  --md-scrollbar-thumb-color: rgba(0, 0, 0, 0.3);
  --md-scrollbar-thumb-hover-color: rgba(0, 0, 0, 0.35);
  --md-scrollbar-thumb-active-color: rgba(0, 0, 0, 0.38);
  color: var(--md-color);
  font-family: inherit;
  border: 1px solid var(--md-border-color);
  background-color: var(--md-bk-color);
  height: 350px;
}

.ͼ15 {
  color: var(--secondary-900);
}
</style>
