<template>
  <div class="vc-table-cell-html" v-html="truncatedHtml" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import htmlTruncate from "truncate-html";
import * as DOMPurify from "dompurify";

const props = defineProps<{
  /** The HTML content to sanitize and display */
  value?: unknown;
  /** Maximum character length before truncation (default: 30) */
  maxLength?: number;
}>();

// Cache for sanitized HTML to avoid repeated DOMPurify calls
const sanitizedHtmlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 500;

function getSanitizedHtml(html: string): string {
  if (sanitizedHtmlCache.has(html)) {
    return sanitizedHtmlCache.get(html)!;
  }

  const sanitized = DOMPurify.default.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "table",
      "thead", "tbody", "tr", "th", "td", "hr", "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "colspan", "rowspan", "align", "valign"],
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"],
  });

  if (sanitizedHtmlCache.size >= MAX_CACHE_SIZE) {
    const firstKey = sanitizedHtmlCache.keys().next().value;
    if (firstKey !== undefined) {
      sanitizedHtmlCache.delete(firstKey);
    }
  }

  sanitizedHtmlCache.set(html, sanitized);
  return sanitized;
}

const sanitizedHtml = computed(() => {
  if (!props.value) return "";
  return getSanitizedHtml(String(props.value));
});

const truncatedHtml = computed(() =>
  htmlTruncate(sanitizedHtml.value, props.maxLength || 30),
);
</script>

<style lang="scss">
.vc-table-cell-html {
  @apply tw-p-1 tw-truncate;
}
</style>
