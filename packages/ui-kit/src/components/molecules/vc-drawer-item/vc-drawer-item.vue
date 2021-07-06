<template>
  <component
    :is="to ? 'a' : 'div'"
    :href="to"
    class="vc-drawer-item"
    @click="$emit('click')"
  >
    <div
      class="vc-drawer-item__handler"
      :class="{ 'vc-drawer-item__handler_enabled': !sticky }"
    >
      <vc-icon icon="ellipsis-v" size="m" />
    </div>
    <div v-if="icon" class="vc-drawer-item__icon">
      <vc-icon :icon="icon" size="m" />
    </div>
    <div class="vc-drawer-item__title" :title="title">{{ title }}</div>
  </component>
</template>

<script>
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  components: { VcIcon },

  props: {
    sticky: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
    },

    title: {
      type: String,
    },

    to: {
      type: String,
    },
  },

  emits: ["click"],
});
</script>
