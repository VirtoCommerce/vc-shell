<template>
  <div
    class="vc-blade"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :class="[
      $attrs.class,
      { 'vc-blade_expanded': $isMobile.value || expanded },
    ]"
  >
    <!-- Init blade header -->
    <vc-blade-header
      class="vc-flex-shrink_0"
      v-if="!$isMobile.value || closable"
      :expanded="expanded"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      @close="$emit('close')"
    >
      <template v-slot:actions v-if="$slots['actions']">
        <slot name="actions"></slot>
      </template>
    </vc-blade-header>

    <!-- Set up blade toolbar -->
    <vc-blade-toolbar
      class="vc-flex-shrink_0"
      :items="toolbarItems"
    ></vc-blade-toolbar>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcBladeHeader from "./_internal/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";

export default defineComponent({
  name: "VcBlade",

  inheritAttrs: false,

  components: {
    VcBladeHeader,
    VcBladeToolbar,
  },

  props: {
    icon: {
      type: String,
    },

    title: {
      type: String,
    },

    subtitle: {
      type: String,
    },

    width: {
      type: [Number, String],
      default: "30%",
    },

    expanded: {
      type: Boolean,
      default: false,
    },

    closable: {
      type: Boolean,
      default: true,
    },

    toolbarItems: {
      type: Array,
      default: () => [],
    },
  },
});
</script>

<style lang="less">
:root {
  --blade-background-color: #ffffff;
  --blade-border-radius: 6px;
  --blade-shadow: 2px 2px 8px rgba(126, 142, 157, 0.14);
  --blade-margin: var(--margin-l) var(--margin-s);
}

.vc-app_mobile {
  --blade-margin: 0;
  --blade-border-radius: 0;
}

.vc-blade {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  background: var(--blade-background-color);
  border-radius: var(--blade-border-radius);
  box-shadow: var(--blade-shadow);
  margin: var(--blade-margin);
  overflow: hidden;
  transition: width 0.2s ease;

  &_expanded {
    width: 100% !important;
    flex-shrink: 1;
  }
}
</style>
