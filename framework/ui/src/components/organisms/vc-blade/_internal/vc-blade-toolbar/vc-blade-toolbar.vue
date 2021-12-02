<template>
  <div
    v-if="isToolbarVisible()"
    class="vc-blade-toolbar vc-flex-shrink_0"
    :class="{ 'vc-blade-toolbar_expanded': isExpanded }"
  >
    <div class="vc-blade-toolbar__buttons">
      <template v-for="item in items" :key="item.id">
        <vc-blade-toolbar-button
          v-if="item.isVisible === undefined || item.isVisible"
          v-bind="item"
          :isExpanded="isExpanded"
        />
      </template>
    </div>
    <vc-icon
      class="vc-blade-toolbar__expand"
      :icon="`fas fa-chevron-${isExpanded ? 'up' : 'down'}`"
      @click="toggleToolbar"
    ></vc-icon>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcBladeToolbarButton from "./_internal/vc-blade-toolbar-button/vc-blade-toolbar-button.vue";

export default defineComponent({
  name: "VcBladeToolbar",

  components: {
    VcBladeToolbarButton,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  setup(props) {
    const isExpanded = ref(true);
    try {
      isExpanded.value =
        localStorage.getItem("VC_BLADE_TOOLBAR_IS_EXPANDED") === "true";
    } catch (err) {
      isExpanded.value = true;
    }

    function toggleToolbar() {
      isExpanded.value = !isExpanded.value;
      localStorage.setItem(
        "VC_BLADE_TOOLBAR_IS_EXPANDED",
        isExpanded.value.toString()
      );
    }

    return {
      isExpanded,
      toggleToolbar,
      isToolbarVisible() {
        const visibleItems = (props.items as { isVisible: boolean }[]).filter(
          (item) => item.isVisible === undefined || item.isVisible
        );
        return !!visibleItems.length;
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --blade-toolbar-height: 36px;
  --blade-toolbar-height-expanded: 50px;
  --blade-toolbar-background-color: #ffffff;
}

.vc-blade-toolbar {
  height: var(--blade-toolbar-height);
  background-color: var(--blade-toolbar-background-color);
  border-bottom: 1px solid #eaedf3;
  display: flex;
  box-sizing: border-box;
  width: 100%;
  justify-content: space-between;
  align-items: stretch;

  &__buttons {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    overflow-x: auto;
    padding: 0 var(--padding-s);
  }

  &_expanded {
    height: var(--blade-toolbar-height-expanded);
  }

  &__expand {
    align-self: center;
    justify-self: flex-end;
    color: #a1c0d4;
    cursor: pointer;
    margin-right: var(--margin-l);

    &:hover {
      color: #7ea8c4;
    }
  }
}
</style>
