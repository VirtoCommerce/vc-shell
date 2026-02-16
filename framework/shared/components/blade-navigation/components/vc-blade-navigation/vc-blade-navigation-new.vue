<template>
  <div class="vc-blade-navigation tw-flex tw-flex-col tw-grow tw-basis-0 tw-min-w-0 tw-overflow-hidden">
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
        :back-button="
          bladeCount > 1
            ? mobileBackButtonFor(index)
            : undefined
        "
        @close="onClose"
        @parent-call="onParentCall"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, inject, Ref, toRef } from "vue";
import { RouterView, useRouter } from "vue-router";
import { watchDebounced } from "@vueuse/core";
import { VcBladeSlot } from "../vc-blade-slot";
import VcMobileBackButton from "./_internal/vc-mobile-back-button.vue";
import { useBladeStack } from "../../composables/useBladeStack";
import { useBladeMessaging } from "../../composables/useBladeMessaging";
import { createUrlSync } from "../../utils/urlSync";
import { useBreadcrumbs } from "../../../../../core/composables/useBreadcrumbs";
import { AiAgentServiceKey } from "../../../../../injection-keys";
import type { BladeDescriptor, IParentCallArgs } from "../../types";

const bladeStack = useBladeStack();
const messaging = useBladeMessaging();
const router = useRouter();
const { breadcrumbs, push, remove } = useBreadcrumbs();

// ── URL sync helper (centralized in urlSync.ts) ─────────────────────────────

const { syncUrlReplace } = createUrlSync(router, bladeStack);

// ── Blade state ─────────────────────────────────────────────────────────────

const blades = computed(() => bladeStack.blades.value);
const activeBlade = computed(() => bladeStack.activeBlade.value);
const hasBlades = computed(() => blades.value.length > 0);

const bladeCount = computed(() => {
  return blades.value.filter((b) => b.visible).length;
});

// ── Visibility logic ────────────────────────────────────────────────────────

const isMobile = inject("isMobile") as Ref<boolean>;

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

// ── Breadcrumbs sync ────────────────────────────────────────────────────────

watchDebounced(
  blades,
  (newVal) => {
    // Clear existing breadcrumbs
    breadcrumbs.value.forEach((bc) => bc && remove([bc.id]));

    // Rebuild from current blade stack
    newVal.forEach((descriptor, index) => {
      push({
        id: index.toString(),
        title: toRef({ title: descriptor.name }, "title"),
        clickHandler: async (id) => {
          const targetIndex = parseInt(id) + 1;
          const bladeToClose = blades.value[targetIndex];
          if (bladeToClose) {
            const prevented = await bladeStack.closeBlade(bladeToClose.id);
            if (!prevented) {
              syncUrlReplace();
            }
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
  const prevented = await bladeStack.closeBlade(bladeId);
  if (!prevented) {
    syncUrlReplace();
  }
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
        const prevented = await bladeStack.closeBlade(blade.id);
        if (!prevented) syncUrlReplace();
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
