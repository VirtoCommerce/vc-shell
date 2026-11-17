<template>
  <div
    ref="root"
    class="assets-folder-grid"
    :class="{ 'assets-folder-grid--selecting': selection.length > 0 }"
    :style="tracks ? { gridTemplateColumns: `repeat(${tracks.count}, ${tracks.width}px)` } : undefined"
    role="list"
  >
    <div
      v-for="entry in items"
      :key="entry.url"
      class="assets-folder-grid__card"
      :class="{
        'assets-folder-grid__card--folder': entry.type === 'folder',
        'assets-folder-grid__card--selected': isSelected(entry),
        'assets-folder-grid__card--active': entry.url === activeUrl,
        'assets-folder-grid__card--drop-target': isDropTarget(entry),
        'assets-folder-grid__card--menu-open': openMenuUrl === entry.url,
      }"
      role="listitem"
      tabindex="0"
      :aria-label="entry.name"
      :aria-describedby="metaId(entry)"
      :data-folder-url="entry.type === 'folder' ? folderUrlOf(entry) : undefined"
      @click="emit('open', entry)"
      @keydown.enter.self.prevent="emit('open', entry)"
      @keydown.space.self.prevent="selectable && toggle(entry)"
      v-on="entry.type === 'folder' ? dropListeners(entry) : {}"
    >
      <div class="assets-folder-grid__preview">
        <VcIcon
          v-if="entry.type === 'folder'"
          icon="lucide-folder"
          size="xxxl"
          class="assets-folder-grid__folder-icon"
        />
        <VcImage
          v-else-if="isImage(entry.name)"
          class="assets-folder-grid__image"
          :src="entry.url"
          aspect="4x3"
          background="contain"
        />
        <div
          v-else
          class="assets-folder-grid__badge"
          :style="{ backgroundColor: getExtensionColor(entry.name) }"
        >
          {{ getExtensionLabel(entry.name) }}
        </div>
      </div>

      <div class="assets-folder-grid__body">
        <span
          class="assets-folder-grid__name"
          :title="entry.name"
        >
          {{ entry.name }}
        </span>
        <span
          :id="metaId(entry)"
          class="assets-folder-grid__meta"
          >{{ meta(entry) }}</span
        >
      </div>

      <div
        v-if="selectable"
        class="assets-folder-grid__check"
        @click.stop
      >
        <VcCheckbox
          :model-value="isSelected(entry)"
          :aria-label="t('ASSETS_MANAGER.FOLDER.GRID.SELECT', { name: entry.name })"
          @update:model-value="toggle(entry)"
        />
      </div>

      <div
        class="assets-folder-grid__menu"
        @click.stop
      >
        <VcDropdown
          :model-value="openMenuUrl === entry.url"
          :items="openMenuUrl === entry.url ? visibleActions(entry) : []"
          :is-item-disabled="(action: TableAction) => !!action.disabled"
          floating
          placement="bottom-end"
          variant="secondary"
          close-on-select
          @item-click="(action: TableAction) => action.clickHandler()"
          @update:model-value="openMenuUrl = $event ? entry.url : undefined"
        >
          <template #trigger="{ isActive, toggle: toggleMenu, panelId }">
            <button
              type="button"
              class="assets-folder-grid__more"
              :aria-label="t('ASSETS_MANAGER.FOLDER.GRID.MORE')"
              :title="t('ASSETS_MANAGER.FOLDER.GRID.MORE')"
              aria-haspopup="menu"
              :aria-expanded="!!isActive"
              :aria-controls="isActive ? panelId : undefined"
              @click="toggleMenu"
              @keydown.enter.stop
              @keydown.space.stop
            >
              <VcIcon
                icon="lucide-ellipsis"
                size="s"
              />
            </button>
          </template>
          <template #item="{ item }">
            <VcDropdownItem
              :data-test-id="item.id"
              :class="{ 'assets-folder-grid__action--danger': item.type === 'danger' }"
              :title="toValue(item.title)"
              :icon="item.icon"
              :disabled="!!item.disabled"
            />
          </template>
        </VcDropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, toValue, useId } from "vue";
import { useDebounceFn, useEventListener, useResizeObserver } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { getExtensionColor, getExtensionLabel, isImage, readableSize } from "@core/utilities/assets";
import { formatDateRelative } from "@core/utilities/date";
import type { TableAction } from "@ui/components/organisms/vc-data-table/types";
import { VcIcon, VcImage } from "@ui/components/atoms";
import { VcCheckbox } from "@ui/components/molecules/vc-checkbox";
import { VcDropdown, VcDropdownItem } from "@ui/components/molecules/vc-dropdown";
import { folderUrlOf } from "../useAssetsFolder";
import { flip } from "./flip";
import { readWidthTransition } from "./width-transition";
import type { BlobEntry } from "../types";

const props = defineProps<{
  items: BlobEntry[];
  selection: BlobEntry[];
  selectable: boolean;
  activeUrl?: string;
  dropTargetUrl?: string;
  actions: (entry: BlobEntry) => TableAction[];
}>();

const emit = defineEmits<{
  "update:selection": [selection: BlobEntry[]];
  open: [entry: BlobEntry];
  "folder-dragover": [entry: BlobEntry, event: DragEvent];
  "folder-dragleave": [entry: BlobEntry, event: DragEvent];
  "folder-drop": [entry: BlobEntry, event: DragEvent];
}>();

const { t } = useI18n({ useScope: "global" });

// Hidden actions are dropped, disabled ones stay listed but inert, as in the table.
const visibleActions = (entry: BlobEntry) => props.actions(entry).filter((action) => !action.hidden);

// The meta line is read after the name, not as part of it.
const idPrefix = useId();
const metaId = (entry: BlobEntry) => `${idPrefix}-meta-${props.items.indexOf(entry)}`;

// Opening or closing a sibling blade animates this blade's width. Re-flowing on every frame
// makes cards resize and jump between rows. Instead the grid reads where the width transition
// ends, switches to that layout at once and glides the cards there in step with the blade;
// the clipped edge covers the difference meanwhile. A resize without a readable transition
// (window, devtools) re-flows once it settles.
const MIN_CARD_WIDTH = 160;
const SETTLE_MS = 100;
// The predicted width can miss the real one by a pixel; at a column threshold that would add or drop
// a column right after the glide. Within this much the column count stays and only the tracks are fitted.
const WIDTH_TOLERANCE = 2;
const root = ref<HTMLElement>();
const tracks = ref<{ count: number; width: number }>();
let contentWidth = 0;
// The width the current tracks were planned for: measured, or predicted from a transition.
let plannedWidth = 0;

function gapOf(): number {
  return root.value ? parseFloat(getComputedStyle(root.value).columnGap) || 0 : 0;
}

function fit(count: number, width: number) {
  return { count, width: Math.floor((width - gapOf() * (count - 1)) / count) };
}

function tracksFor(width: number) {
  const gap = gapOf();
  return fit(Math.max(1, Math.floor((width + gap) / (MIN_CARD_WIDTH + gap))), width);
}

function reflow(width: number, timing?: { duration: number; easing: string }) {
  const current = tracks.value;
  if (current && Math.abs(width - plannedWidth) <= WIDTH_TOLERANCE) {
    plannedWidth = width;
    tracks.value = fit(current.count, width);
    return;
  }
  plannedWidth = width;
  const next = tracksFor(width);
  if (current && next.count === current.count && next.width === current.width) return;
  const cards = Array.from(root.value?.querySelectorAll<HTMLElement>(".assets-folder-grid__card") ?? []);
  return flip(
    cards,
    () => {
      tracks.value = next;
      return nextTick();
    },
    timing,
  );
}

const settleTracks = useDebounceFn((width: number) => reflow(width), SETTLE_MS);

useResizeObserver(root, ([entry]) => {
  contentWidth = entry.contentRect.width;
  if (tracks.value === undefined) {
    plannedWidth = contentWidth;
    tracks.value = tracksFor(contentWidth);
  } else void settleTracks(contentWidth);
});

// Transition events bubble, so an ancestor's width transition is seen here when it starts.
useEventListener(document, "transitionrun", (event: TransitionEvent) => {
  if (event.propertyName !== "width" || !root.value || !(event.target instanceof Element)) return;
  if (event.target === root.value || !event.target.contains(root.value)) return;
  const change = readWidthTransition(event.target);
  if (change) void reflow(contentWidth + change.delta, { duration: change.duration, easing: change.easing });
});

// Only one card menu is open at a time; its actions are built when it opens.
const openMenuUrl = ref<string>();

const isSelected = (entry: BlobEntry) => props.selection.some((item) => item.url === entry.url);
const isDropTarget = (entry: BlobEntry) => entry.type === "folder" && props.dropTargetUrl === folderUrlOf(entry);

function toggle(entry: BlobEntry) {
  emit(
    "update:selection",
    isSelected(entry) ? props.selection.filter((item) => item.url !== entry.url) : [...props.selection, entry],
  );
}

function meta(entry: BlobEntry): string {
  const kind = entry.type === "folder" ? t("ASSETS_MANAGER.FOLDER.FOLDER_LABEL") : readableSize(entry.size ?? 0);
  const ago = formatDateRelative(entry.modifiedDate);
  return ago ? `${kind} · ${ago}` : kind;
}

// A folder card is its own drop target; stopping propagation keeps the blade from uploading here too.
function dropListeners(entry: BlobEntry) {
  return {
    dragover: (event: DragEvent) => {
      event.stopPropagation();
      emit("folder-dragover", entry, event);
    },
    dragleave: (event: DragEvent) => {
      event.stopPropagation();
      emit("folder-dragleave", entry, event);
    },
    drop: (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      emit("folder-drop", entry, event);
    },
  };
}
</script>

<style lang="scss">
:root {
  --assets-folder-grid-card-background: var(--additional-50);
  --assets-folder-grid-card-border: var(--neutrals-300);
  --assets-folder-grid-card-border-hover: var(--neutrals-400);
  --assets-folder-grid-preview-background: var(--secondary-100);
  --assets-folder-grid-name-color: var(--neutrals-800);
  --assets-folder-grid-muted-color: var(--neutrals-500);
  --assets-folder-grid-folder-color: var(--primary-500);
  --assets-folder-grid-folder-fill: var(--primary-100);
  --assets-folder-grid-selected-border: var(--primary-500);
  --assets-folder-grid-selected-background: var(--primary-50);
  --assets-folder-grid-active-border: var(--neutrals-500);
  --assets-folder-grid-drop-outline: var(--primary-500);
  --assets-folder-grid-drop-background: var(--primary-50);
  --assets-folder-grid-focus-ring: var(--primary-500);
  --assets-folder-grid-control-background: var(--additional-50);
  // The 400 step is the first neutral that reads against both the light and the dark preview.
  --assets-folder-grid-control-border: var(--neutrals-400);
  --assets-folder-grid-control-color: var(--neutrals-600);
  --assets-folder-grid-danger-color: var(--danger-500);
  // Sits on the fixed extension colors, which do not change with the theme.
  --assets-folder-grid-badge-color: #ffffff;
}

.assets-folder-grid {
  @apply tw-grid tw-gap-4 tw-p-4 tw-content-start;
  // Until the first measurement; afterwards the count is set inline.
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

  &__card {
    @apply tw-relative tw-flex tw-flex-col tw-min-w-0 tw-overflow-hidden tw-cursor-pointer;
    @apply tw-rounded-lg tw-border tw-border-solid tw-border-[color:var(--assets-folder-grid-card-border)];
    @apply tw-bg-[color:var(--assets-folder-grid-card-background)];
    @apply tw-transition-colors tw-duration-150;

    &:hover {
      @apply tw-border-[color:var(--assets-folder-grid-card-border-hover)];
    }

    &:focus-visible {
      @apply tw-outline-none;
      box-shadow: 0 0 0 2px var(--assets-folder-grid-focus-ring);
    }

    // The ring doubles the border without changing the card size.
    &--active,
    &--active:hover {
      @apply tw-border-[color:var(--assets-folder-grid-active-border)];
      box-shadow: inset 0 0 0 1px var(--assets-folder-grid-active-border);
    }

    &--selected,
    &--selected:hover {
      @apply tw-border-[color:var(--assets-folder-grid-selected-border)];
      @apply tw-bg-[color:var(--assets-folder-grid-selected-background)];
      box-shadow: inset 0 0 0 1px var(--assets-folder-grid-selected-border);
    }

    &--drop-target,
    &--drop-target:hover {
      @apply tw-bg-[color:var(--assets-folder-grid-drop-background)];
      outline: 2px dashed var(--assets-folder-grid-drop-outline);
      outline-offset: -2px;
    }
  }

  &__preview {
    @apply tw-relative tw-flex tw-items-center tw-justify-center tw-overflow-hidden;
    @apply tw-bg-[color:var(--assets-folder-grid-preview-background)];
    aspect-ratio: 4 / 3;
  }

  &__image {
    @apply tw-w-full;
  }

  // VcIcon puts the class on the <svg> itself; the inner selector covers a wrapper too.
  &__folder-icon,
  &__folder-icon svg {
    @apply tw-text-[color:var(--assets-folder-grid-folder-color)];
    fill: var(--assets-folder-grid-folder-fill);
  }

  &__badge {
    @apply tw-flex tw-items-center tw-justify-center;
    @apply tw-px-4 tw-py-2 tw-rounded-md;
    @apply tw-text-base tw-font-bold tw-tracking-wide;
    @apply tw-text-[color:var(--assets-folder-grid-badge-color)];
  }

  &__body {
    @apply tw-flex tw-flex-col tw-gap-0.5 tw-px-3 tw-py-2 tw-min-w-0;
  }

  &__name {
    @apply tw-block tw-truncate tw-text-sm tw-text-[color:var(--assets-folder-grid-name-color)];
  }

  &__card--folder &__name {
    @apply tw-font-semibold;
  }

  &__meta {
    @apply tw-block tw-truncate tw-text-xs tw-text-[color:var(--assets-folder-grid-muted-color)];
  }

  &__check,
  &__menu {
    @apply tw-absolute tw-top-2 tw-flex tw-items-center tw-justify-center;
    @apply tw-rounded-md tw-bg-[color:var(--assets-folder-grid-control-background)];
    @apply tw-border tw-border-solid tw-border-[color:var(--assets-folder-grid-control-border)];
    @apply tw-shadow-sm;
    @apply tw-opacity-0 tw-transition-opacity tw-duration-150;
  }

  &__check {
    @apply tw-left-2 tw-p-1;
  }

  &__menu {
    @apply tw-right-2;
  }

  &__more {
    @apply tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7 tw-p-0 tw-rounded-md tw-border-0 tw-cursor-pointer;
    @apply tw-bg-transparent tw-text-[color:var(--assets-folder-grid-control-color)];

    &:focus-visible {
      @apply tw-outline-none;
      box-shadow: 0 0 0 2px var(--assets-folder-grid-focus-ring);
    }
  }

  // Controls show on hover and focus; the checkbox stays while anything is selected.
  &__card:hover &__check,
  &__card:hover &__menu,
  &__card:focus-within &__check,
  &__card:focus-within &__menu,
  &__card--menu-open &__menu,
  &--selecting &__check {
    @apply tw-opacity-100;
  }

  // Touch has no hover: keep the controls reachable.
  @media (hover: none) {
    &__check,
    &__menu {
      @apply tw-opacity-100;
    }
  }

  &__action--danger {
    @apply tw-text-[color:var(--assets-folder-grid-danger-color)];
  }
}

@media (max-width: 480px) {
  .assets-folder-grid {
    @apply tw-gap-3 tw-p-3;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
