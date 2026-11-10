<template>
  <div class="vc-search-bar__advanced">
    <SyntaxHelp
      v-if="showHelp"
      :fields="fields"
      @insert="insert"
    />

    <div
      ref="wrap"
      class="vc-search-bar__qwrap"
      @input="update()"
      @click="update()"
      @keyup="onKeyup"
      @keydown="onKeydown"
      @focusout="onFocusout"
    >
      <VcTextarea
        :model-value="modelValue"
        class="vc-search-bar__query"
        :aria-label="$t(`${P}.LABEL`)"
        :placeholder="$t(`${P}.PLACEHOLDER`)"
        @update:model-value="emit('update:modelValue', String($event ?? ''))"
      />
      <Teleport :to="teleportTarget">
        <ul
          v-if="suggest.items.length"
          :id="listId"
          class="vc-search-bar__suggest"
          role="listbox"
          :aria-label="$t(`${P}.SUGGESTIONS`)"
          :style="listStyle"
        >
          <li
            v-for="(it, i) in suggest.items"
            :id="`${listId}-${i}`"
            :key="it.insert"
            role="option"
            class="vc-search-bar__opt"
            :class="{ 'vc-search-bar__opt--active': i === suggest.active }"
            :aria-selected="i === suggest.active"
            :title="it.hint && it.hint !== it.label ? `${it.label} ${it.hint}` : it.label"
            @mousedown.prevent="accept(i)"
          >
            <code class="vc-search-bar__code"
              ><b v-if="matchLen(it)">{{ it.label.slice(0, matchLen(it)) }}</b
              >{{ it.label.slice(matchLen(it)) }}</code
            >
            <span class="vc-search-bar__muted vc-search-bar__opt-hint">{{ it.hint }}</span>
          </li>
        </ul>
      </Teleport>
    </div>

    <p
      v-if="'reason' in parsed"
      class="vc-search-bar__note"
    >
      <VcIcon
        icon="lucide-info"
        size="xs"
      />
      {{ $t(`${P}.NOTE`, { reason: $t(`${P}.REASON_${parsed.reason}`) }) }}
    </p>
    <div
      v-else-if="chips.length"
      class="vc-search-bar__preview"
    >
      <span class="vc-search-bar__muted">{{ $t(`${P}.WILL_APPLY`) }}</span>
      <span
        v-for="c in chips"
        :key="c"
        class="vc-search-bar__chip"
        >{{ c }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watchPostEffect } from "vue";
import { useEventListener } from "@vueuse/core";
import { useTeleportTarget } from "@ui/composables";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import { VcTextarea } from "@ui/components/molecules";
import type { BarField } from "../lib/fields";
import { isEmptyValue, isNot, pillLabel } from "../lib/values";
import type { phraseToState } from "../phrase/convert";
import { LIST_WIDTH, useCaretSuggest } from "../composables/useCaretSuggest";
import SyntaxHelp from "./SyntaxHelp.vue";

const props = defineProps<{
  modelValue: string;
  fields: BarField[];
  /** How the text reads as conditions, computed by the panel */
  parsed: ReturnType<typeof phraseToState>;
  showHelp?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

let listCounter = 0;
const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED";
const { t } = useI18n({ useScope: "global" });

const wrap = ref<HTMLElement>();
const listId = `vc-search-bar-suggest-${++listCounter}`;
const { suggest, update, accept, close, matchLen, onKeydown, onKeyup, onFocusout } = useCaretSuggest({
  fields: () => props.fields,
  wrap,
  t,
  setText: (v) => emit("update:modelValue", v),
});

const { teleportTarget } = useTeleportTarget();
const px = (n: number | undefined) => (n === undefined ? undefined : `${n}px`);
const listStyle = computed(() => ({
  position: "fixed" as const,
  width: `${LIST_WIDTH}px`,
  left: px(suggest.left),
  top: px(suggest.top),
  bottom: px(suggest.bottom),
}));
// The list sits at fixed viewport coordinates, so a scroll moves the text away from it. Typing itself scrolls
// the panel to the caret: the list follows the text while it is in view and closes once it is not.
useEventListener(
  window,
  "scroll",
  (e: Event) => {
    const ta = wrap.value?.querySelector("textarea");
    if (!suggest.items.length || !ta || e.target === ta) return;
    const r = ta.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= window.innerHeight) close();
    else update();
  },
  { capture: true, passive: true },
);
useEventListener(window, "resize", () => close());

// VcTextarea puts attrs on its root, so the combobox attributes go on the textarea itself
watchPostEffect(() => {
  const ta = wrap.value?.querySelector("textarea");
  if (!ta) return;
  const open = suggest.items.length > 0;
  ta.setAttribute("aria-autocomplete", "list");
  if (open) {
    ta.setAttribute("aria-controls", listId);
    ta.setAttribute("aria-activedescendant", `${listId}-${suggest.active}`);
  } else {
    ta.removeAttribute("aria-controls");
    ta.removeAttribute("aria-activedescendant");
  }
});

const chips = computed(() => {
  if (!("state" in props.parsed)) return [];
  const { search, values } = props.parsed.state;
  const out: string[] = [];
  if (search) out.push(t(`${P}.SEARCH_CHIP`, { text: search }));
  for (const f of props.fields) {
    const v = values[f.id];
    if (isEmptyValue(v)) continue;
    const label = pillLabel(f, v, t);
    out.push(f.kind === "toggle" ? label : `${f.label}: ${isNot(v) ? `${t(`${P}.CHIP_NOT`)} ` : ""}${label}`);
  }
  return out;
});

function insert(example: string) {
  const v = props.modelValue.trim();
  emit("update:modelValue", v ? `${v} ${example}` : example);
  nextTick(() => wrap.value?.querySelector("textarea")?.focus());
}
</script>

<style lang="scss">
.vc-search-bar {
  &__advanced {
    @apply tw-flex tw-flex-col tw-gap-2;
  }
  &__qwrap {
    @apply tw-relative;
  }
  &__query .vc-textarea__field {
    font-family: var(--font-mono, ui-monospace, monospace);
    @apply tw-text-sm;
  }
  &__suggest {
    @apply tw-m-0 tw-p-1 tw-list-none tw-rounded-md tw-shadow-lg tw-overflow-y-auto;
    // Above the popover and the bottom sheet the panel lives in
    z-index: var(--z-critical-tooltip);
    max-height: 240px;
    background: var(--additional-50, #fff);
    border: 1px solid var(--neutrals-200);
    b {
      color: var(--primary-700);
    }
  }
  &__opt {
    @apply tw-flex tw-w-full tw-items-center tw-justify-between tw-gap-3 tw-text-sm tw-px-2 tw-py-1.5 tw-rounded tw-cursor-pointer;
    &:hover,
    &--active {
      background: var(--primary-50, var(--neutrals-100));
    }
    .vc-search-bar__code {
      @apply tw-min-w-0 tw-truncate;
    }
  }
  &__opt-hint {
    @apply tw-shrink-0 tw-truncate;
    max-width: 40%;
  }
  &__muted {
    @apply tw-text-xs;
    color: var(--neutrals-600);
  }
  &__note {
    @apply tw-flex tw-items-start tw-gap-1 tw-m-0 tw-text-xs;
    color: var(--neutrals-700);
  }
  &__preview {
    @apply tw-flex tw-flex-wrap tw-items-center tw-gap-1 tw-text-xs;
  }
  &__chip {
    @apply tw-px-2 tw-py-0.5 tw-rounded-full;
    background: var(--primary-50);
    color: var(--primary-800, var(--primary-700));
  }
}
</style>
