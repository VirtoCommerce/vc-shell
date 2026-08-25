<template>
  <div
    class="vc-blade-navigation tw-flex tw-flex-col tw-grow tw-basis-0 tw-min-w-0 tw-overflow-hidden"
    role="region"
    :aria-label="t('COMPONENTS.ORGANISMS.BLADE_NAVIGATION.ARIA_LABEL')"
  >
    <!-- Non-blade routes (Dashboard, etc.) -->
    <RouterView v-if="!hasBlades" />

    <!-- Blade stack -->
    <div
      v-else
      class="tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative tw-min-w-0"
    >
      <VcBladeSlot
        v-for="(descriptor, index) in blades"
        :key="descriptor.id"
        :descriptor="descriptor"
        :closable="index > 0"
        :expanded="descriptor.id === activeBlade?.id"
        :visible="isBladeVisible(descriptor, index)"
        :breadcrumbs="breadcrumbs.slice(0, index)"
        :back-button="bladeCount > 1 ? mobileBackButtonFor(index) : undefined"
        :inert="maximizedBladeId !== undefined && descriptor.id !== maximizedBladeId"
        @close="onClose"
        @parent-call="onParentCall"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, inject, nextTick, onMounted, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { RouterView, useRouter } from "vue-router";
import { useEventListener, watchDebounced } from "@vueuse/core";
import { VcBladeSlot } from "@shell/_internal/blade-navigation/components/vc-blade-slot";
import VcMobileBackButton from "@shell/_internal/blade-navigation/components/vc-blade-navigation/_internal/vc-mobile-back-button.vue";
import { useBladeStack } from "@core/blade-navigation/useBladeStack";
import { useBladeMessaging } from "@core/blade-navigation/useBladeMessaging";
import { createUrlSync } from "@core/blade-navigation/utils/urlSync";
import { useBreadcrumbs } from "@core/composables/useBreadcrumbs";
import { useToolbar } from "@core/composables/useToolbar";
import { usePermissions } from "@core/composables/usePermissions";
import { useIsMac } from "@core/composables/useKeyboardShortcuts";
import { resolveVisibility, resolveReactiveBoolean } from "@ui/components/organisms/vc-blade/utils";
import { createShortcutDispatcher } from "./shortcut-dispatch";
import { resolveShortcutTargetBlade } from "./focus-target";
import { AiAgentServiceKey } from "@framework/injection-keys";
import type { BladeDescriptor, IParentCallArgs } from "@core/blade-navigation/types";

const { t } = useI18n();

const bladeStack = useBladeStack();
const messaging = useBladeMessaging();
const router = useRouter();
const { breadcrumbs, push, remove } = useBreadcrumbs();

// ── URL sync helper ─────────────────────────────────────────────────────────
// The stack syncs itself after every navigation action. This instance covers
// the one write that is not a stack mutation: the post-restore reconcile below.

const { syncUrlReplace } = createUrlSync(router, bladeStack);

// ── Post-restore URL reconcile ──────────────────────────────────────────────
// On a fresh load, restoreFromUrl reopens only the workspace + the deepest
// routable blade. Non-routable blades and intermediate (off-path) blades are
// NOT reopened, yet their table query params still sit in the address bar.
// Once the restored blades have mounted, their tables hydrate their own query
// into the blade descriptors (table-query-state service). Rebuilding the URL
// from the present descriptors then drops any query owned by an absent blade.
// Child `mounted` hooks run before this parent's `onMounted`, so the present
// blades' descriptors are already hydrated here; `nextTick` covers stragglers.
onMounted(() => {
  if (bladeStack.blades.value.length === 0) return;
  void nextTick(() => {
    syncUrlReplace();
  });
});

// ── Blade state ─────────────────────────────────────────────────────────────

const blades = computed(() => bladeStack.blades.value);
const activeBlade = computed(() => bladeStack.activeBlade.value);

// A maximized blade covers the ones behind it, but they stayed in the tab order and
// in the accessibility tree — a keyboard user could tab into content hidden behind
// it (VCST-5632). `inert` removes both in one attribute.
const maximizedBladeId = computed(() => blades.value.find((descriptor) => bladeStack.isMaximized(descriptor.id))?.id);
const hasBlades = computed(() => blades.value.length > 0);

const bladeCount = computed(() => {
  return blades.value.filter((b) => b.visible).length;
});

// ── Visibility logic ────────────────────────────────────────────────────────

const { isMobile } = useResponsive();

const aiAgentService = inject(AiAgentServiceKey, undefined);
const isAiPanelExpanded = computed(() => aiAgentService?.isExpanded.value ?? false);

const visibleBladesCount = computed(() => {
  if (isMobile.value) return 1;
  if (isAiPanelExpanded.value) return 1;
  return 2;
});

function isBladeVisible(descriptor: BladeDescriptor, index: number): boolean {
  if (!descriptor.visible) return false;
  return index >= bladeCount.value - visibleBladesCount.value;
}

// ── Keyboard shortcuts ───────────────────────────────────────────────────────

const { getToolbarItems } = useToolbar();
const { hasAccess } = usePermissions();

const dispatchShortcut = createShortcutDispatcher({
  isMac: useIsMac(),
  // Shortcuts act on the blade holding focus, not on whatever sits on top of
  // the stack (VCST-5680). Read live: focus moves without the stack changing.
  getActiveBlade: () =>
    resolveShortcutTargetBlade(
      bladeStack.blades.value,
      bladeStack.activeBlade.value,
      typeof document !== "undefined" ? document.activeElement : null,
    ),
  getToolbarItems: (bladeId) => getToolbarItems(bladeId),
  isMobile: () => isMobile.value,
  isEnabled: (item) =>
    hasAccess(item.permissions) && resolveVisibility(item.isVisible) && !resolveReactiveBoolean(item.disabled),
  closeBlade: (id) => bladeStack.closeBlade(id),
  toggleMaximized: (id) => bladeStack.toggleMaximized(id),
  isModalOpen: () => typeof document !== "undefined" && document.querySelector('[aria-modal="true"]') !== null,
});

useEventListener(window, "keydown", dispatchShortcut);

// ── Breadcrumbs sync ────────────────────────────────────────────────────────

watchDebounced(
  blades,
  (newVal) => {
    // Clear existing breadcrumbs
    breadcrumbs.value.forEach((bc) => bc && remove([bc.id]));

    // Rebuild from current blade stack (skip hidden blades from coverCurrentBlade)
    newVal
      .filter((b) => b.visible)
      .forEach((descriptor, index) => {
        push({
          id: index.toString(),
          title: toRef({ title: descriptor.name }, "title"),
          clickHandler: async (id) => {
            const visibleIndex = parseInt(id);
            // Map visible index back to actual blade in stack
            const visibleBlades = blades.value.filter((b) => b.visible);
            const targetBlade = visibleBlades[visibleIndex + 1];
            if (targetBlade) {
              const prevented = await bladeStack.closeBlade(targetBlade.id);
              return !prevented;
            }
            return true;
          },
        });
      });
  },
  {
    deep: true,
    immediate: true,
    flush: "post",
    debounce: 10,
  },
);

// ── Event handlers ──────────────────────────────────────────────────────────

async function onClose(bladeId: string): Promise<void> {
  await bladeStack.closeBlade(bladeId);
}

async function onParentCall(args: IParentCallArgs, bladeId: string): Promise<void> {
  try {
    const result = await messaging.callParent(bladeId, args.method as string, args.args);
    args.callback?.(result);
  } catch (error) {
    console.warn("[VcBladeNavigation] Parent call failed:", error);
  }
}

// ── Mobile back button ──────────────────────────────────────────────────────

function mobileBackButtonFor(index: number): ReturnType<typeof h> | undefined {
  if (index <= 0) return undefined;
  return h(VcMobileBackButton, {
    breadcrumbs: breadcrumbs.value.slice(0, index),
    onBack: async () => {
      const blade = blades.value[index];
      if (blade) {
        await bladeStack.closeBlade(blade.id);
      }
    },
  });
}
</script>

<style lang="scss">
:root {
  --blade-navigation-bg-color: var(--additional-50);
  --blade-navigation-shadow-color: var(--additional-950);
  --blade-navigation-shadow: 2px 2px 8px rgb(from var(--blade-navigation-shadow-color) r g b / 7%);
  --blade-navigation-border-radius: var(--blade-border-radius);
}
</style>
