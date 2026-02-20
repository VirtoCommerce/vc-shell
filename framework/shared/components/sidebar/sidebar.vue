<template>
  <template v-if="isSidebarVisible">
    <VcSidebar
      :model-value="true"
      :position="position"
      :title="title"
      :close-button="closeCross"
      :teleport="!isDesktop"
      @update:model-value="onModelUpdate"
    >
      <template
        v-if="$slots.header"
        #header="{ close }"
      >
        <slot
          name="header"
          :close="close"
        />
      </template>

      <slot name="content" />
    </VcSidebar>
  </template>

  <template v-else>
    <slot name="content" />
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, ref, type Ref } from "vue";
import { IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import { VcSidebar } from "@ui/components";

export interface Props {
  position?: "left" | "right";
  render?: "always" | "mobile" | "desktop";
  isExpanded: boolean;
  title?: string;
  closeCross?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  position: "right",
  render: "always",
  closeCross: true,
});

const emit = defineEmits<{
  (event: "close"): void;
}>();

defineSlots<{
  header?: (args: { close: () => void }) => unknown;
  content?: () => unknown;
}>();

const isMobile = inject(IsMobileKey, ref(false));
const isDesktop = inject(IsDesktopKey, ref(false));

const renderMatchesViewport = computed(() => {
  if (props.render === "always") {
    return true;
  }

  if (props.render === "mobile") {
    return isMobile.value;
  }

  return isDesktop.value;
});

const isSidebarVisible = computed(() => props.isExpanded && renderMatchesViewport.value);

function onModelUpdate(value: boolean) {
  if (!value) {
    emit("close");
  }
}
</script>
