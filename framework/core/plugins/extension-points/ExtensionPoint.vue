<template>
  <!-- Scoped slot: host has full rendering control -->
  <slot
    v-if="$slots.default"
    :components="visibleComponents"
    :has-components="hasVisibleComponents"
  />

  <!-- Layout mode: wrapper with separator/gap -->
  <div
    v-else-if="hasLayout && hasVisibleComponents"
    :class="wrapperClass"
    :style="wrapperStyle"
  >
    <hr
      v-if="separator"
      :class="separatorClass || 'vc-extension-point__separator'"
    >
    <component
      v-for="extension in visibleComponents"
      :key="extension.id"
      :is="extension.component"
      v-bind="extension.props || {}"
    />
  </div>

  <!-- Plain mode: no wrapper (backward-compatible) -->
  <template v-else>
    <component
      v-for="extension in visibleComponents"
      :key="extension.id"
      :is="extension.component"
      v-bind="extension.props || {}"
    />
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { defineExtensionPoint } from "./defineExtensionPoint";
import type { ExtensionComponent } from "./types";

interface Props {
  /** Extension point name (e.g. "auth:after-form") */
  name: string;
  /** Adds an <hr> separator before the components */
  separator?: boolean;
  /** Custom CSS class for the <hr> separator */
  separatorClass?: string;
  /** CSS class for the wrapper <div> */
  wrapperClass?: string;
  /** CSS gap value between components (e.g. "1rem", "16px") */
  gap?: string;
  /** Filter components by meta fields (e.g. { type: "action" }) */
  filter?: Record<string, unknown>;
}

const props = defineProps<Props>();

defineSlots<{
  default?: (props: { components: ExtensionComponent[]; hasComponents: boolean }) => any;
}>();

// Auto-declares the extension point when the component is used in a template
const { components } = defineExtensionPoint(props.name);

const visibleComponents = computed(() => {
  if (!props.filter) return components.value;
  const entries = Object.entries(props.filter);
  return components.value.filter(
    (c) => c.meta && entries.every(([key, value]) => c.meta![key] === value),
  );
});

const hasVisibleComponents = computed(() => visibleComponents.value.length > 0);

const hasLayout = computed(
  () => props.separator || props.separatorClass || props.wrapperClass || props.gap,
);

const wrapperStyle = computed(() => {
  if (!props.gap) return undefined;
  return {
    display: "flex",
    flexDirection: "column" as const,
    gap: props.gap,
  };
});
</script>

<style lang="scss">
.vc-extension-point__separator {
  @apply tw-border-t tw-border-solid tw-border-[color:var(--secondary-200)] tw-mb-4;
}
</style>
