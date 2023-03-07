<template>
  <div
    class="vc-blade tw-relative tw-flex tw-shrink-0 tw-flex-col tw-bg-[color:var(--blade-background-color)] tw-rounded-[var(--blade-border-radius)] tw-shadow-[2px_2px_8px_rgba(126,142,157,0.14)] tw-my-4 tw-mx-2 tw-overflow-hidden tw-transition-[width] tw-duration-200"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :class="[$attrs.class, { '!tw-w-full !tw-shrink': $isMobile.value || expanded }]"
  >
    <!-- Init blade header -->
    <VcBladeHeader
      class="tw-shrink-0"
      v-if="!$isMobile.value || closable"
      :expanded="expanded"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      @close="$emit('close')"
    >
      <template
        v-slot:actions
        v-if="$slots['actions']"
      >
        <slot name="actions"></slot>
      </template>
    </VcBladeHeader>

    <!-- Set up blade toolbar -->
    <VcBladeToolbar
      class="tw-shrink-0"
      :items="toolbarItems"
    ></VcBladeToolbar>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import VcBladeHeader from "./_internal/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";
import { bladeEmits, bladeProps } from "./vc-blade-model";

defineProps(bladeProps);

defineEmits(bladeEmits);
</script>

<style lang="scss">
:root {
  --blade-background-color: #ffffff;
  --blade-border-radius: 6px;
}

.vc-app_mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}
</style>
