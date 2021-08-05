<template>
  <component
    :is="to ? 'a' : 'div'"
    :href="to"
    class="vc-nav-item"
    @click="$emit('click')"
  >
    <div
      class="vc-nav-item__handler"
      :class="{ 'vc-nav-item__handler_enabled': !sticky }"
    >
      <vc-icon icon="ellipsis-v" size="m" />
    </div>
    <div v-if="icon" class="vc-nav-item__icon">
      <vc-icon :icon="icon" size="m" />
    </div>
    <div class="vc-nav-item__title" :title="title">{{ title }}</div>
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
      default: "",
    },

    title: {
      type: String,
      default: "",
    },

    to: {
      type: String,
      default: "",
    },
  },

  emits: ["click"],
});
</script>

<style lang="less">
.vc-nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--nav-item-height);
  background-color: var(--nav-item-background-color);
  border-bottom: 1px solid var(--nav-item-border-bottom-color);
  flex-wrap: nowrap;
  box-sizing: border-box;
  cursor: pointer;
  text-decoration: none;

  &__handler {
    width: var(--nav-item-handler-width);
    color: var(--nav-item-handler-color);
    text-align: center;
    visibility: hidden;
    flex-shrink: 0;

    &_enabled {
      cursor: move;
    }
  }

  &__icon {
    width: var(--nav-item-icon-width);
    color: var(--nav-item-icon-color);
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: var(--nav-item-title-font-size);
    font-weight: var(--nav-item-title-font-weight);
    padding-right: var(--nav-item-title-padding-right);
    padding-left: var(--nav-item-title-padding-left);
    color: var(--nav-item-title-color);
  }

  &:hover {
    background-color: var(--nav-item-background-color-hover);
  }

  &:hover &__handler {
    &_enabled {
      visibility: visible;
    }
  }
}
</style>
