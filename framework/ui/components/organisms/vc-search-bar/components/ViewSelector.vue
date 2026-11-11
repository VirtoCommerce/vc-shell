<template>
  <span class="vc-search-bar__view-selector">
    <button
      ref="trigger"
      type="button"
      class="vc-search-bar__view-btn"
      :class="{ 'vc-search-bar__view-btn--open': open }"
      :disabled="disabled"
      :aria-label="
        modified
          ? `${$t(`${K}SELECTOR`, { name: current.name })}, ${$t(`${K}MODIFIED`)}`
          : $t(`${K}SELECTOR`, { name: current.name })
      "
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="toggle"
    >
      <VcIcon
        icon="lucide-bookmark"
        size="s"
        class="vc-search-bar__view-btn-icon"
      />
      <span class="vc-search-bar__view-btn-name">{{ current.name }}</span>
      <span
        v-if="modified"
        class="vc-search-bar__view-badge"
        >{{ $t(`${K}MODIFIED`) }}</span
      >
      <VcIcon
        icon="lucide-chevron-down"
        size="s"
      />
    </button>
    <MenuHost
      v-if="open"
      :sheet="false"
      :anchor="trigger"
      role="dialog"
      :aria-label="$t(`${K}SAVED_VIEWS`)"
      @close="close"
    >
      <div
        ref="menu"
        class="vc-search-bar__views-menu"
      >
        <div
          class="vc-search-bar__views-title"
          aria-hidden="true"
        >
          {{ $t(`${K}SAVED_VIEWS`) }}
        </div>
        <ul class="vc-search-bar__views-list">
          <li
            v-for="v in views.all.value"
            :key="v.id"
            class="vc-search-bar__view-row"
          >
            <ViewNameField
              v-if="renaming === v.id"
              :label="$t(`${K}NEW_NAME`)"
              :initial="v.name"
              @save="(name) => act(() => views.rename(v.id, name))"
              @cancel="cancelRename(v.id)"
            />
            <div
              v-else
              class="vc-search-bar__view-line"
            >
              <button
                type="button"
                class="vc-search-bar__view-item"
                :aria-current="v.id === current.id || undefined"
                @click="act(() => views.select(v.id))"
              >
                <VcIcon
                  icon="lucide-check"
                  size="xs"
                  class="vc-search-bar__view-check"
                  :class="{ 'vc-search-bar__view-check--on': v.id === current.id }"
                />
                <span class="vc-search-bar__view-item-name">{{ v.name }}</span>
                <span
                  v-if="counts?.[v.id] !== undefined"
                  class="vc-search-bar__view-count"
                  >{{ counts[v.id] }}</span
                >
              </button>
              <button
                v-if="v.scope === 'user'"
                type="button"
                class="vc-search-bar__view-more"
                :data-view-id="v.id"
                :aria-label="$t(`${K}OPTIONS`, { name: v.name })"
                :aria-expanded="optionsFor === v.id"
                @click="optionsFor = optionsFor === v.id ? null : v.id"
              >
                <VcIcon
                  icon="lucide-ellipsis"
                  size="xs"
                />
              </button>
            </div>
            <div
              v-if="optionsFor === v.id && renaming !== v.id"
              class="vc-search-bar__view-options"
            >
              <button
                type="button"
                @click="startRename(v.id)"
              >
                <VcIcon
                  icon="lucide-pencil"
                  size="s"
                  class="vc-search-bar__row-icon"
                />
                <span class="vc-search-bar__row-text">{{ $t(`${K}RENAME`) }}</span>
              </button>
              <button
                type="button"
                class="vc-search-bar__view-options-danger"
                @click="act(() => views.remove(v.id))"
              >
                <VcIcon
                  icon="lucide-trash-2"
                  size="s"
                  class="vc-search-bar__row-icon"
                />
                <span class="vc-search-bar__row-text">{{ $t(`${K}DELETE`) }}</span>
              </button>
            </div>
          </li>
        </ul>
        <div
          v-if="modified"
          class="vc-search-bar__views-modified"
        >
          <button
            v-if="current.scope !== 'system'"
            type="button"
            class="vc-search-bar__views-action"
            @click="act(views.saveChanges)"
          >
            <VcIcon
              icon="lucide-check"
              size="s"
              class="vc-search-bar__row-icon"
            />
            <span class="vc-search-bar__row-text">{{ $t(`${K}SAVE_CHANGES`, { name: current.name }) }}</span>
          </button>
          <ViewNameField
            v-if="naming"
            :label="$t(`${K}NAME_PLACEHOLDER`)"
            @save="(name) => act(() => views.saveAs(name))"
            @cancel="cancelNaming"
          />
          <button
            v-else
            type="button"
            class="vc-search-bar__views-action vc-search-bar__views-save-as"
            @click="naming = true"
          >
            <VcIcon
              icon="lucide-bookmark"
              size="s"
              class="vc-search-bar__row-icon"
            />
            <span class="vc-search-bar__row-text">{{ $t(`${K}SAVE_AS_NEW`) }}</span>
          </button>
          <button
            type="button"
            class="vc-search-bar__views-action"
            @click="act(views.revert)"
          >
            <VcIcon
              icon="lucide-rotate-ccw"
              size="s"
              class="vc-search-bar__row-icon"
            />
            <span class="vc-search-bar__row-text">{{ $t(`${K}REVERT`, { name: current.name }) }}</span>
          </button>
        </div>
      </div>
    </MenuHost>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { VcIcon } from "@ui/components/atoms";
import MenuHost from "./MenuHost.vue";
import ViewNameField from "./ViewNameField.vue";
import type { ViewsApi } from "../composables/useViews";

defineOptions({ name: "ViewSelector" });

const props = defineProps<{
  views: ViewsApi;
  /** Result count per view id; a view without one shows none */
  counts?: Record<string, number>;
  disabled?: boolean;
}>();

const K = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.";

const trigger = ref<HTMLButtonElement>();
const menu = ref<HTMLElement>();
const open = ref(false);
const naming = ref(false);
const renaming = ref<string | null>(null);
const optionsFor = ref<string | null>(null);

const current = computed(() => props.views.current.value);
const modified = computed(() => props.views.modified.value);

function toggle() {
  if (open.value) close();
  else open.value = true;
}

function close() {
  open.value = false;
  naming.value = false;
  renaming.value = null;
  optionsFor.value = null;
  void nextTick(() => trigger.value?.focus());
}

/** The name field unmounts on cancel; focus goes back to the control that opened it */
function refocus(find: (menu: HTMLElement) => HTMLElement | null | undefined) {
  void nextTick(() => menu.value && find(menu.value)?.focus());
}

function cancelRename(id: string) {
  renaming.value = null;
  refocus((m) =>
    [...m.querySelectorAll<HTMLElement>(".vc-search-bar__view-more")].find((b) => b.dataset.viewId === id),
  );
}

function cancelNaming() {
  naming.value = false;
  refocus((m) => m.querySelector<HTMLElement>(".vc-search-bar__views-save-as"));
}

function startRename(id: string) {
  optionsFor.value = null;
  renaming.value = id;
}

/** Every action closes the menu and hands focus back to the button */
function act(run: () => void) {
  run();
  close();
}
</script>

<style lang="scss">
.vc-search-bar {
  &__view-selector {
    @apply tw-inline-flex tw-min-w-0;
  }
  &__view-btn {
    @apply tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2 tw-font-medium tw-shrink-0;
    height: 28px;
    border-radius: 6px;
    font-size: 13px;
    color: var(--neutrals-800);
    &:hover:not(:disabled),
    &--open {
      background: var(--neutrals-100);
    }
    &:disabled {
      opacity: 0.55;
      cursor: default;
    }
  }
  &__view-btn-icon {
    color: var(--neutrals-400);
  }
  &__view-btn-name {
    @apply tw-truncate;
    max-width: 220px;
  }
  &__view-badge {
    @apply tw-inline-flex tw-items-center tw-px-1.5 tw-font-semibold;
    height: 18px;
    border-radius: 4px;
    font-size: 10.5px;
    background: var(--warning-100);
    color: var(--warning-800);
  }
  &__views-menu {
    @apply tw-flex tw-flex-col tw-gap-1;
  }
  &__views-title {
    @apply tw-uppercase tw-font-semibold tw-px-2 tw-pt-1;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--neutrals-500);
  }
  &__views-list {
    @apply tw-flex tw-flex-col;
  }
  &__view-line {
    @apply tw-flex tw-items-center;
  }
  &__view-item {
    @apply tw-flex tw-flex-1 tw-items-center tw-gap-2 tw-px-2 tw-rounded tw-text-start tw-min-w-0;
    height: 32px;
    font-size: 13px;
    &:hover {
      background: var(--neutrals-100);
    }
  }
  &__view-check {
    color: var(--primary-600);
    visibility: hidden;
    &--on {
      visibility: visible;
    }
  }
  &__view-item-name {
    @apply tw-flex-1 tw-truncate;
  }
  &__view-count {
    font-size: 12px;
    color: var(--neutrals-500);
  }
  &__view-more {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-rounded tw-shrink-0;
    width: 28px;
    height: 28px;
    color: var(--neutrals-500);
    &:hover,
    &[aria-expanded="true"] {
      background: var(--neutrals-100);
    }
  }
  &__view-options {
    @apply tw-flex tw-flex-col tw-ms-6 tw-mb-1;
    button {
      @apply tw-flex tw-items-center tw-gap-2 tw-text-start tw-px-2 tw-rounded tw-min-w-0;
      height: 32px;
      font-size: 13px;
      &:hover {
        background: var(--neutrals-100);
      }
    }
  }
  &__view-options-danger {
    color: var(--danger-600, var(--danger-500));
    .vc-search-bar__row-icon {
      color: inherit;
    }
  }
  &__row-icon {
    @apply tw-shrink-0;
    color: var(--neutrals-500);
  }
  &__row-text {
    @apply tw-truncate;
  }
  &__views-modified {
    @apply tw-flex tw-flex-col tw-gap-0.5 tw-p-1 tw-mt-1;
    border: 1px solid var(--neutrals-200);
    border-radius: 6px;
  }
  &__views-action {
    @apply tw-flex tw-items-center tw-gap-2 tw-text-start tw-px-2 tw-rounded tw-min-w-0;
    height: 32px;
    font-size: 13px;
    &:hover {
      background: var(--neutrals-100);
    }
  }
}
</style>
