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

<style lang="less">
.vc-drawer-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--drawer-item-height);
  background-color: var(--drawer-item-background-color);
  border-bottom: 1px solid var(--drawer-item-border-bottom-color);
  flex-wrap: nowrap;
  box-sizing: border-box;
  cursor: pointer;
  text-decoration: none;

  &__handler {
    width: var(--drawer-item-handler-width);
    color: var(--drawer-item-handler-color);
    text-align: center;
    visibility: hidden;
    flex-shrink: 0;

    &_enabled {
      cursor: move;
    }
  }

  &__icon {
    width: var(--drawer-item-icon-width);
    color: var(--drawer-item-icon-color);
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: var(--drawer-item-title-font-size);
    font-weight: var(--drawer-item-title-font-weight);
    padding-right: var(--drawer-item-title-padding-right);
    padding-left: var(--drawer-item-title-padding-left);
    color: var(--drawer-item-title-color);
  }

  &:hover {
    background-color: var(--drawer-item-background-color-hover);
  }

  &:hover &__handler {
    &_enabled {
      visibility: visible;
    }
  }
}
</style>
