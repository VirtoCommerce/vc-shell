<template>
  <component
    :is="popup.component"
    v-for="popup in popupPlugin?.popups"
    :key="popup.id"
    v-bind="{ ...popup.props, ...popup.emits }"
    @close="() => popup.close?.()"
  >
    <template
      v-for="(slot, key) in popup.slots"
      #[key]
      :key="key"
    >
      <div
        v-if="typeof slot === 'string'"
        class="tw-h-full tw-w-full"
        v-html="sanitizeHtml(slot)"
      ></div>
      <component
        :is="slot"
        v-else
      ></component>
    </template>
  </component>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-named-as-default
import DOMPurify from "dompurify";
import { getPopupPlugin } from "./../../utils";

const popupPlugin = getPopupPlugin();

/**
 * Sanitize HTML content to prevent XSS attacks
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "table",
      "thead", "tbody", "tr", "th", "td", "hr", "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "colspan", "rowspan", "align", "valign"],
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"],
  });
}
</script>
