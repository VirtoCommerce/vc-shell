<template>
  <ErrorInterceptor :capture="true">
    <!-- eslint-disable-next-line vue/no-unused-vars -- error available for future use -->
    <template #default="{ error, reset: resetInterceptor }">
      <component
        :is="bladeComponent"
        v-if="bladeComponent"
        v-show="visible"
        ref="bladeInstanceRef"
        :param="descriptor.param"
        :options="descriptor.options"
        :closable="closable"
        :expanded="expanded"
        @close:blade="onCloseBlade"
        @parent:call="onParentCall"
        @expand:blade="onExpand"
        @collapse:blade="onCollapse"
        @vue:unmounted="resetInterceptor"
      />
    </template>
  </ErrorInterceptor>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, provide, ref, watch } from "vue";
import { useBladeRegistry } from "@core/composables/useBladeRegistry";
import { BladeBackButtonKey } from "@framework/injection-keys";
import { ErrorInterceptor } from "@shell/components/error-interceptor";
import { useBladeMessaging } from "@core/blade-navigation/useBladeMessaging";
import type { BladeDescriptor, IParentCallArgs, IBladeBanner } from "@core/blade-navigation/types";
import { BladeDescriptorKey, BladeMaximizedKey, BladeBannersKey } from "@core/blade-navigation/types";
import type { Breadcrumbs } from "@ui/types";
import type { Component } from "vue";

const props = defineProps<{
  descriptor: BladeDescriptor;
  closable: boolean;
  expanded: boolean;
  visible: boolean;
  breadcrumbs?: Breadcrumbs[];
  backButton?: Component;
}>();

const emit = defineEmits<{
  (e: "close", bladeId: string): void;
  (e: "parentCall", args: IParentCallArgs, bladeId: string): void;
}>();

const bladeRegistry = useBladeRegistry();
const maximized = ref(false);
const banners = ref<IBladeBanner[]>([]);
const bladeInstanceRef = ref<CoreBladeExposed>();

// Resolve blade component from registry
const bladeComponent = computed(() => {
  return bladeRegistry.getBladeComponent(props.descriptor.name);
});

// ── Provide enriched BladeDescriptor ─────────────────────────────────────────
provide(
  BladeDescriptorKey,
  computed(() => ({
    ...props.descriptor,
    maximized: maximized.value,
    breadcrumbs: props.breadcrumbs,
  })),
);

// Provide writable maximized ref so VcBlade can toggle expand/collapse directly
provide(BladeMaximizedKey, maximized);
provide(BladeBannersKey, banners);

// Provide back button component
provide(
  BladeBackButtonKey,
  computed(() => props.backButton),
);

// ── Auto-register exposed methods with BladeMessaging ───────────────────────
// Bridges defineExpose() (old API) → exposeToChildren() (new BladeMessaging)
const messaging = useBladeMessaging();

watch(
  bladeInstanceRef,
  (instance) => {
    if (!instance) return;
    const methods: Record<string, (...args: any[]) => any> = {};
    for (const key of Object.keys(instance)) {
      if (typeof instance[key] === "function") {
        methods[key] = instance[key];
      }
    }
    if (Object.keys(methods).length > 0) {
      messaging.exposeToChildren(props.descriptor.id, methods);
    }
  },
  { flush: "post" },
);

// Clean up exposed methods when blade is removed from the stack.
// Hidden blades (v-show via replaceCurrentBlade) stay mounted — their methods persist.
// Only truly removed blades (v-for key removed) trigger onBeforeUnmount.
onBeforeUnmount(() => {
  messaging.cleanup(props.descriptor.id);
});

// ── Event handlers ──────────────────────────────────────────────────────────

function onCloseBlade(): void {
  emit("close", props.descriptor.id);
}

function onParentCall(args: IParentCallArgs): void {
  emit("parentCall", args, props.descriptor.id);
}

function onExpand(): void {
  maximized.value = true;
}

function onCollapse(): void {
  maximized.value = false;
}
</script>
