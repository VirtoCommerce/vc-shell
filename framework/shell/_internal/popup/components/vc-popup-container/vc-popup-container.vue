<template>
  <PopupInstanceProvider
    v-for="(popup, index) in popupPlugin?.popups"
    :key="popup.id ?? index"
    :closing="popup.closing === true"
    @finalize="() => finalize(popup)"
  >
    <component
      :is="popup.component"
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
  </PopupInstanceProvider>
</template>

<script setup lang="ts">
import DOMPurify from "dompurify";
import { getPopupPlugin } from "@shell/_internal/popup/utils";
import PopupInstanceProvider from "@shell/_internal/popup/components/vc-popup-container/PopupInstanceProvider.vue";

const popupPlugin = getPopupPlugin();

/**
 * Second phase of closing: the popup has finished its leave transition, so the
 * instance can go.
 *
 * Delegates to the instance's own `finalize` rather than splicing here. Removing it
 * locally is what made the first attempt at VCST-5632 fail: this path always wins
 * the race against the fallback timer in `usePopup`, so the focus restore attached
 * to that timer never ran. One removal path, one place that restores focus.
 */
function finalize(popup: { finalize?: () => void }): void {
  popup.finalize?.();
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
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
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "colspan", "rowspan", "align", "valign"],
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"],
  });
}
</script>
