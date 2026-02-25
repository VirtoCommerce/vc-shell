<template>
  <ErrorInterceptor
    :capture="true"
  >
    <template #default="{ error: interceptorError, reset: resetInterceptor }">
      <Transition
        name="blade-slide"
        appear
      >
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
      </Transition>
    </template>
  </ErrorInterceptor>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, provide, ref, watch, watchEffect } from "vue";
import { useBladeRegistry } from "@core/composables/useBladeRegistry";
import { BladeInstance as BladeInstanceKey, BLADE_BACK_BUTTON } from "@framework/injection-keys";
import { ErrorInterceptor } from "@shared/components/error-interceptor";
import { useBladeMessaging } from "@shared/components/blade-navigation/composables/useBladeMessaging";
import { useBladeStack } from "@shared/components/blade-navigation/composables/useBladeStack";
import type { BladeDescriptor, IBladeInstance, IParentCallArgs } from "@shared/components/blade-navigation/types";
import { BladeDescriptorKey } from "@shared/components/blade-navigation/types";
import type { CoreBladeExposed } from "@shared/components/blade-navigation/types";
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
const bladeStack = useBladeStack();
const maximized = ref(false);
const bladeInstanceRef = ref<CoreBladeExposed>();

// Resolve blade component from registry
const bladeComponent = computed(() => {
  return bladeRegistry.getBladeComponent(props.descriptor.name);
});

// ── Provide new injection key (BladeDescriptor) ─────────────────────────────
provide(
  BladeDescriptorKey,
  computed(() => props.descriptor),
);

// ── Provide legacy injection key (BladeInstance) for backward compatibility ──
provide(
  BladeInstanceKey,
  computed<IBladeInstance>(() => ({
    id: props.descriptor.name.toLowerCase(),
    param: props.descriptor.param,
    options: props.descriptor.options,
    expandable: props.closable, // expandable when there are multiple blades
    maximized: maximized.value,
    error: (props.descriptor.error as IBladeInstance["error"]) ?? null,
    navigation: undefined, // No longer VNode-based
    breadcrumbs: props.breadcrumbs,
    title: bladeInstanceRef.value?.title,
  })),
);

// Provide back button component
provide(BLADE_BACK_BUTTON, computed(() => props.backButton));

// ── Auto-register exposed methods with BladeMessaging ───────────────────────
// Bridges defineExpose() (old API) → exposeToChildren() (new BladeMessaging)
const messaging = useBladeMessaging();

watch(bladeInstanceRef, (instance) => {
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
}, { flush: "post" });

// Clean up exposed methods when blade is removed from the stack.
// Hidden blades (v-show via replaceCurrentBlade) stay mounted — their methods persist.
// Only truly removed blades (v-for key removed) trigger onBeforeUnmount.
onBeforeUnmount(() => {
  messaging.cleanup(props.descriptor.id);
});

// ── Propagate exposed title to BladeStack ────────────────────────────────────
// Uses watchEffect so it tracks reactivity of bladeInstanceRef.value?.title
// (which may be a ref exposed via defineExpose)
watchEffect(() => {
  const title = bladeInstanceRef.value?.title;
  if (title !== undefined) {
    bladeStack.setBladeTitle(props.descriptor.id, title);
  }
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

<style lang="scss">
.blade-slide-enter-active {
  transition:
    opacity 0.25s ease-out,
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.blade-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.blade-slide-leave-active {
  transition:
    opacity 0.15s ease-in,
    transform 0.15s ease-in;
}

.blade-slide-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
