<template>
  <span class="vc-search-bar__view-selector">
    <VcButton
      ref="trigger"
      class="vc-search-bar__view-btn"
      :class="{ 'vc-search-bar__view-btn--open': open }"
      variant="ghost"
      size="2xs"
      icon="lucide-bookmark"
      icon-class="vc-search-bar__view-btn-icon"
      :selected="open"
      :aria-pressed="undefined"
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
      <span class="vc-search-bar__view-btn-name">{{ current.name }}</span>
      <VcBadge
        v-if="modified"
        class="vc-search-bar__view-badge"
        :content="$t(`${K}MODIFIED`)"
        variant="warning"
        size="s"
        inline
        label
      />
      <VcIcon
        icon="lucide-chevron-down"
        size="s"
      />
    </VcButton>
    <MenuHost
      :open="open"
      :sheet="false"
      :anchor="triggerEl"
      fit
      role="dialog"
      :aria-label="$t(`${K}SAVED_VIEWS`)"
      @close="close"
    >
      <div
        ref="menu"
        class="vc-search-bar__views-menu vc-search-bar__fit"
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
              <VcButton
                class="vc-search-bar__menu-row vc-search-bar__view-item"
                variant="ghost"
                size="sm"
                icon="lucide-check"
                icon-size="xs"
                :icon-class="`vc-search-bar__view-check${v.id === current.id ? ' vc-search-bar__view-check--on' : ''}`"
                :aria-current="v.id === current.id || undefined"
                @click="act(() => views.select(v.id))"
              >
                <span class="vc-search-bar__view-item-name">{{ v.name }}</span>
                <span
                  v-if="counts?.[v.id] !== undefined"
                  class="vc-search-bar__view-count"
                  >{{ counts[v.id] }}</span
                >
              </VcButton>
              <VcButton
                v-if="v.scope === 'user'"
                class="vc-search-bar__view-more"
                variant="ghost"
                size="2xs"
                icon="lucide-ellipsis"
                icon-size="xs"
                :selected="optionsFor === v.id"
                :aria-pressed="undefined"
                :data-view-id="v.id"
                :aria-label="$t(`${K}OPTIONS`, { name: v.name })"
                :aria-expanded="optionsFor === v.id"
                @click="optionsFor = optionsFor === v.id ? null : v.id"
              />
            </div>
            <div
              v-if="optionsFor === v.id && renaming !== v.id"
              class="vc-search-bar__view-options"
            >
              <VcButton
                class="vc-search-bar__menu-row"
                variant="ghost"
                size="sm"
                icon="lucide-pencil"
                icon-class="vc-search-bar__row-icon"
                @click="startRename(v.id)"
              >
                {{ $t(`${K}RENAME`) }}
              </VcButton>
              <VcButton
                class="vc-search-bar__menu-row vc-search-bar__view-options-danger"
                variant="ghost"
                size="sm"
                icon="lucide-trash-2"
                icon-class="vc-search-bar__row-icon"
                @click="act(() => views.remove(v.id))"
              >
                {{ $t(`${K}DELETE`) }}
              </VcButton>
            </div>
          </li>
        </ul>
        <div
          v-if="modified"
          class="vc-search-bar__views-modified"
        >
          <VcButton
            v-if="current.scope !== 'system'"
            class="vc-search-bar__menu-row vc-search-bar__views-action"
            variant="ghost"
            size="sm"
            icon="lucide-check"
            icon-class="vc-search-bar__row-icon"
            @click="act(views.saveChanges)"
          >
            {{ $t(`${K}SAVE_CHANGES`, { name: current.name }) }}
          </VcButton>
          <ViewNameField
            v-if="naming"
            :label="$t(`${K}NAME_PLACEHOLDER`)"
            @save="(name) => act(() => views.saveAs(name))"
            @cancel="cancelNaming"
          />
          <VcButton
            v-else
            class="vc-search-bar__menu-row vc-search-bar__views-action vc-search-bar__views-save-as"
            variant="ghost"
            size="sm"
            icon="lucide-bookmark"
            icon-class="vc-search-bar__row-icon"
            @click="naming = true"
          >
            {{ $t(`${K}SAVE_AS_NEW`) }}
          </VcButton>
          <VcButton
            class="vc-search-bar__menu-row vc-search-bar__views-action"
            variant="ghost"
            size="sm"
            icon="lucide-rotate-ccw"
            icon-class="vc-search-bar__row-icon"
            @click="act(views.revert)"
          >
            {{ $t(`${K}REVERT`, { name: current.name }) }}
          </VcButton>
        </div>
      </div>
    </MenuHost>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance } from "vue";
import { VcBadge, VcButton, VcIcon } from "@ui/components/atoms";
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

const trigger = ref<ComponentPublicInstance>();
const triggerEl = computed(() => trigger.value?.$el as HTMLButtonElement | undefined);
const menu = ref<HTMLElement>();
const open = ref(false);
const naming = ref(false);
const renaming = ref<string | null>(null);
const optionsFor = ref<string | null>(null);

const current = computed(() => props.views.current.value);
const modified = computed(() => props.views.modified.value);

// A menu opens fresh; a closing one keeps what it showed while it fades out
function toggle() {
  if (open.value) return close();
  naming.value = false;
  renaming.value = null;
  optionsFor.value = null;
  open.value = true;
}

function close() {
  open.value = false;
  void nextTick(() => triggerEl.value?.focus());
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
    --button-ghost-text-color: var(--neutrals-800);
    @apply tw-shrink-0;

    .vc-button__title {
      @apply tw-inline-flex tw-items-center tw-gap-1.5;
    }
  }
  &__view-btn-icon {
    color: var(--neutrals-400);
  }
  &__view-btn-name {
    @apply tw-truncate;
    max-width: 220px;
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
  // the title and the modified-view actions stay in view; the list scrolls between them
  &__views-list {
    @apply tw-flex tw-flex-col tw-min-h-0 tw-overflow-y-auto;
  }
  &__view-line {
    @apply tw-flex tw-items-center tw-gap-0.5;
  }
  &__view-item {
    @apply tw-flex-1;
  }
  &__view-check {
    @apply tw-shrink-0;
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
    color: var(--neutrals-500);
  }
  &__view-more {
    --button-ghost-text-color: var(--neutrals-500);
    @apply tw-shrink-0;
  }
  &__view-options {
    @apply tw-flex tw-flex-col tw-ms-6 tw-mb-1;
  }
  &__view-options-danger {
    --button-ghost-text-color: var(--danger-600, var(--danger-500));
    .vc-search-bar__row-icon {
      color: inherit;
    }
  }
  &__row-icon {
    @apply tw-shrink-0;
    color: var(--neutrals-500);
  }
  &__views-modified {
    @apply tw-flex tw-flex-col tw-gap-0.5 tw-p-1 tw-mt-1;
    border: 1px solid var(--neutrals-200);
    border-radius: 6px;
  }
}
</style>
