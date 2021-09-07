<template>
  <div
    class="vc-blade"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :class="{ 'vc-blade_expanded': expanded }"
  >
    <!-- Init blade header -->
    <vc-blade-header
      :expandable="expandable"
      :expanded="expanded"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      @expand="$emit('expand')"
      @collapse="$emit('collapse')"
      @close="$emit('close')"
    ></vc-blade-header>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcBladeHeader from "../../molecules/vc-blade-header/vc-blade-header.vue";

export default defineComponent({
  name: "VcBlade",
  components: {
    VcBladeHeader,
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

    expandable: {
      type: Boolean,
      default: false,
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

  &_expanded {
    width: 100% !important;
    flex-shrink: 1;
  }
}
</style>
