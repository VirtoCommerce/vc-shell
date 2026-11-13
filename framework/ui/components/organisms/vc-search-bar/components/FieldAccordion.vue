<template>
  <div class="vc-search-bar__acc">
    <div
      v-for="f in fields"
      :key="f.id"
      class="vc-search-bar__acc-item"
    >
      <div class="vc-search-bar__acc-row">
        <!-- a toggle has nothing to expand: the row shows it and its remove button -->
        <component
          :is="f.kind === 'toggle' ? 'div' : 'button'"
          :type="f.kind === 'toggle' ? undefined : 'button'"
          class="vc-search-bar__acc-toggle"
          :aria-expanded="f.kind === 'toggle' ? undefined : isOpen(f.id)"
          :aria-controls="f.kind === 'toggle' ? undefined : bodyId(f.id)"
          @click="f.kind !== 'toggle' && flip(f.id)"
        >
          <span
            v-if="f.kind === 'toggle'"
            class="vc-search-bar__acc-chevron"
            aria-hidden="true"
          />
          <VcIcon
            v-else
            icon="lucide-chevron-down"
            :custom-size="14"
            class="vc-search-bar__acc-chevron"
            :class="{ 'vc-search-bar__acc-chevron--closed': !isOpen(f.id) }"
          />
          <span class="vc-search-bar__acc-label">{{ f.label }}</span>
          <span
            v-if="f.kind !== 'toggle'"
            class="vc-search-bar__acc-value"
            :class="{ 'vc-search-bar__acc-value--set': isSet(f.id) }"
            :title="isSet(f.id) ? summary(f).title : undefined"
            >{{ isSet(f.id) ? summary(f).text : $t(`${K}PANEL.ANY`) }}</span
          >
        </component>
        <VcButton
          v-if="isSet(f.id)"
          class="vc-search-bar__acc-clear"
          variant="ghost"
          size="icon-sm"
          icon="lucide-x"
          :aria-label="$t(`${K}REMOVE_FILTER`, { label: f.label })"
          @click="emit('clear-field', f.id)"
        />
      </div>
      <!-- the body grows from 0 to its content's height and back; the editor unmounts after the close -->
      <Transition
        name="vc-search-bar-acc"
        @before-enter="collapse"
        @enter="expandToContent"
        @after-enter="release"
        @before-leave="fixHeight"
        @leave="collapse"
      >
        <div
          v-if="f.kind !== 'toggle' && isOpen(f.id)"
          :id="bodyId(f.id)"
          class="vc-search-bar__acc-body"
        >
          <div class="vc-search-bar__acc-scroll">
            <PillEditor
              :field="f"
              :value="state.values[f.id]"
              :counts="counts?.[f.id]"
              @update:value="onValue"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcIcon } from "@ui/components/atoms";
import type { BarField } from "../lib/fields";
import { chipLabel, isEmptyValue } from "../lib/values";
import type { SearchBarState, SearchBarValue } from "../types";
import PillEditor from "./PillEditor.vue";

defineOptions({ name: "FieldAccordion" });

const props = defineProps<{
  fields: BarField[];
  state: SearchBarState;
  /** Results per option value, per field id */
  counts?: Record<string, Record<string, number>>;
  /** Id of the field expanded on mount */
  initiallyOpen?: string;
}>();
const emit = defineEmits<{ set: [id: string, value: SearchBarValue]; "clear-field": [id: string] }>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.";
const { t, locale } = useI18n({ useScope: "global" });
const uid = `vc-search-bar-acc-${useId()}`;

// One field open at a time: opening another closes it, clicking the open one closes it
const open = ref<string | undefined>(props.initiallyOpen);
const isOpen = (id: string) => open.value === id;
const flip = (id: string) => {
  open.value = open.value === id ? undefined : id;
};
const bodyId = (id: string) => `${uid}-${id}`;

// The body's height animates between 0 and its content's measured height; the CSS transition ends each step
const collapse = (el: Element) => {
  const body = el as HTMLElement;
  void body.offsetHeight;
  body.style.height = "0px";
};
const fixHeight = (el: Element) => {
  (el as HTMLElement).style.height = `${(el as HTMLElement).offsetHeight}px`;
  // a field reopened while it closes mounts a new body with the same id; the leaving one gives it up
  el.removeAttribute("id");
};
const expandToContent = (el: Element) => {
  const body = el as HTMLElement;
  void body.offsetHeight;
  body.style.height = `${body.scrollHeight}px`;
};
const release = (el: Element) => {
  (el as HTMLElement).style.height = "";
};

const isSet = (id: string) => !isEmptyValue(props.state.values[id]);
const summary = (f: BarField) => chipLabel(f, props.state.values[f.id], t, locale?.value);

const onValue = (v: SearchBarValue | undefined, id: string) =>
  isEmptyValue(v) ? emit("clear-field", id) : emit("set", id, v);
</script>

<style lang="scss">
.vc-search-bar {
  &__acc {
    @apply tw-flex tw-flex-col;
  }
  &__acc-item + &__acc-item {
    border-top: 1px solid var(--neutrals-100);
  }
  &__acc-row {
    @apply tw-flex tw-items-center tw-gap-1 tw-px-2;
    min-height: 40px;
  }
  &__acc-toggle {
    @apply tw-flex tw-flex-1 tw-items-center tw-gap-2 tw-min-w-0 tw-px-1 tw-text-left tw-rounded-md;
    min-height: 32px;
    font-size: 13px;
  }
  button.vc-search-bar__acc-toggle:hover {
    background: var(--neutrals-50);
  }
  &__acc-chevron {
    @apply tw-shrink-0 tw-transition-transform;
    width: 14px;
    color: var(--neutrals-500);
  }
  &__acc-chevron--closed {
    transform: rotate(-90deg);
  }
  &__acc-label {
    @apply tw-shrink-0 tw-font-medium;
    color: var(--neutrals-900);
  }
  &__acc-value {
    @apply tw-ms-auto tw-truncate;
    max-width: 60%;
    font-size: 12.5px;
    color: var(--neutrals-400);
  }
  &__acc-value--set {
    color: var(--primary-700);
  }
  &__acc-clear {
    --button-ghost-text-color: var(--neutrals-500);
    @apply tw-shrink-0;
  }
  &__acc-body {
    background: var(--neutrals-50);
  }
  &__acc-scroll {
    @apply tw-overflow-y-auto tw-px-3 tw-py-2;
    max-height: 256px;
  }
}

// VcAccordion's duration; the closing field and the opening one move together
.vc-search-bar-acc-enter-active,
.vc-search-bar-acc-leave-active {
  @apply tw-overflow-hidden;
  transition: height 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .vc-search-bar-acc-enter-active,
  .vc-search-bar-acc-leave-active {
    transition: none;
  }
}
</style>
