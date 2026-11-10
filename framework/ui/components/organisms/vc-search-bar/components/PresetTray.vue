<template>
  <div
    ref="root"
    class="vc-search-bar__presets"
    role="group"
    :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.LABEL')"
  >
    <VcIcon
      icon="lucide-bookmark"
      size="xs"
      class="vc-search-bar__tray-icon"
      aria-hidden="true"
    />
    <span
      v-for="p in presets.pinned.value"
      :key="p.id"
      class="vc-search-bar__preset"
      :data-preset-id="p.id"
      :class="{
        'vc-search-bar__preset--on': presets.lit(p.id),
        'vc-search-bar__preset--new': presets.flashId.value === p.id,
        'vc-search-bar__preset--menu-open': menu?.id === p.id,
      }"
      @contextmenu.prevent.stop="openChipMenu(p.id, $event)"
    >
      <button
        type="button"
        class="vc-search-bar__preset-main"
        :aria-pressed="presets.lit(p.id)"
        :disabled="disabled"
        @click="onChipClick(p)"
      >
        <VcIcon
          v-if="presets.lit(p.id)"
          icon="lucide-check"
          size="xs"
        />{{ p.name }}
      </button>
      <button
        v-if="presets.actionsFor(p).length"
        type="button"
        class="vc-search-bar__preset-more"
        :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.OPTIONS', { name: p.name })"
        :aria-expanded="menu?.id === p.id"
        :disabled="disabled"
        @click.stop="openChipMenu(p.id, $event)"
      >
        <VcIcon
          icon="lucide-ellipsis"
          size="xs"
        />
      </button>
    </span>
    <button
      type="button"
      class="vc-search-bar__tray-all"
      :aria-expanded="menu?.kind === 'all'"
      :aria-label="allLabel"
      :title="allLabel"
      :disabled="disabled"
      @click="openAll($event)"
    >
      <span v-if="moreCount">+{{ moreCount }}</span>
      <VcIcon
        icon="lucide-chevron-down"
        size="xs"
      />
    </button>

    <VcPopover
      v-if="menu"
      :show="true"
      :anchor-ref="anchor"
      :title="menuTitle"
      width="260px"
      max-width="360px"
      @update:show="!$event && close()"
    >
      <AllPresets
        v-if="menu.kind === 'all'"
        :presets="presets"
      />
      <div
        v-else-if="menuPreset"
        class="vc-search-bar__chip-menu"
      >
        <p class="vc-search-bar__origin">
          {{
            $t(
              menuPreset.scope === "module"
                ? "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.FROM_MODULE"
                : "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.YOURS",
            )
          }}
        </p>
        <PresetActions
          :preset="menuPreset"
          :presets="presets"
          @done="onMenuDone"
        />
      </div>
    </VcPopover>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms";
import { VcPopover } from "@ui/components/molecules";
import type { PresetsApi } from "../composables/usePresets";
import type { StoredPreset } from "../lib/storage";
import AllPresets from "./AllPresets.vue";
import PresetActions from "./PresetActions.vue";

defineOptions({ name: "PresetTray" });

const props = defineProps<{ presets: PresetsApi; disabled?: boolean }>();
const emit = defineEmits<{
  /** A chip menu or the all-presets list opened or closed */
  "menu-change": [open: boolean];
}>();
const { t } = useI18n({ useScope: "global" });

const menu = ref<{ kind: "chip" | "all"; id?: string }>();
const anchor = ref<HTMLElement | null>(null);
const menuPreset = computed(() => props.presets.all.value.find((p) => p.id === menu.value?.id));
const menuTitle = computed(() =>
  menu.value?.kind === "all" ? t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.ALL") : (menuPreset.value?.name ?? ""),
);
const allLabel = computed(() =>
  moreCount.value
    ? t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.ALL_COUNT", { count: moreCount.value })
    : t("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.ALL"),
);
const moreCount = computed(() => props.presets.all.value.length - props.presets.pinned.value.length);

watch(
  () => !!menu.value,
  (open) => emit("menu-change", open),
);

function close() {
  menu.value = undefined;
}

function openChipMenu(id: string, e: Event) {
  const chip = (e.currentTarget as HTMLElement).closest<HTMLElement>(".vc-search-bar__preset");
  if (menu.value?.id === id) return close();
  anchor.value = chip;
  menu.value = { kind: "chip", id };
}

function openAll(e: Event) {
  if (menu.value?.kind === "all") return close();
  anchor.value = e.currentTarget as HTMLElement;
  menu.value = { kind: "all" };
}

const root = ref<HTMLElement>();

// After a menu action the chip (or, if it is gone, the All presets button) takes focus back
async function onMenuDone() {
  const id = menu.value?.id;
  close();
  await nextTick();
  const el =
    root.value?.querySelector<HTMLElement>(`[data-preset-id="${id}"] .vc-search-bar__preset-main`) ??
    root.value?.querySelector<HTMLElement>(".vc-search-bar__tray-all");
  el?.focus();
}

function onChipClick(p: StoredPreset) {
  close();
  props.presets.click(p);
}
</script>

<style lang="scss">
.vc-search-bar {
  &__presets {
    @apply tw-flex tw-items-center tw-gap-1 tw-rounded-full tw-shrink-0;
    padding: 2px 2px 2px 10px;
    height: 32px;
    background: var(--neutrals-100);
  }
  &__tray-icon {
    @apply tw-shrink-0 tw-me-0.5;
    color: var(--neutrals-500);
  }
  &__tray-all {
    @apply tw-inline-flex tw-items-center tw-gap-0.5 tw-px-2 tw-rounded-full tw-text-xs tw-h-full tw-shrink-0;
    color: var(--neutrals-700);
    &:hover {
      background: var(--neutrals-200);
    }
  }
  &__preset {
    @apply tw-inline-flex tw-items-center tw-rounded-full tw-text-xs tw-whitespace-nowrap tw-shrink-0 tw-h-full;
    border: 1px solid var(--neutrals-200);
    background: var(--additional-50, #fff);
    color: var(--neutrals-700);

    &--on {
      border-color: var(--primary-500);
      background: var(--primary-50);
      color: var(--primary-700);
    }
  }
  &__preset-main {
    @apply tw-inline-flex tw-items-center tw-gap-1 tw-h-full tw-ps-3;
  }
  &__preset-more {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-h-full tw-rounded-full;
    width: 24px;
    opacity: 0;
    color: currentColor;
  }
  &__preset:hover &__preset-more,
  &__preset:focus-within &__preset-more,
  &__preset--menu-open &__preset-more {
    opacity: 0.8;
  }
  &__chip-menu {
    @apply tw-flex tw-flex-col tw-gap-1 tw-p-2;
  }
  &__origin {
    @apply tw-m-0 tw-px-2 tw-text-xs;
    color: var(--neutrals-600);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vc-search-bar__preset--new {
    box-shadow: 0 0 0 3px var(--primary-200, var(--primary-300));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .vc-search-bar__preset--new {
    animation: vc-search-bar-flash 1.6s ease-out;
  }
}

@keyframes vc-search-bar-flash {
  0%,
  30% {
    box-shadow: 0 0 0 3px var(--primary-200, var(--primary-300));
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
</style>
