<template>
  <div
    v-if="isToolbarVisible()"
    class="h-[var(--blade-toolbar-height)] bg-[color:var(--blade-toolbar-background-color)] border-b-[color:#eaedf3] border-solid border-b flex box-border w-full content-center items-stretch shrink-0"
    :class="{ '!h-[var(--blade-toolbar-height-expanded)]': isExpanded }"
  >
    <div class="grow flex content-start items-center overflow-x-auto px-s">
      <template v-for="item in items" :key="item.id">
        <VcBladeToolbarButton
          v-if="item.isVisible === undefined || item.isVisible"
          v-bind="item"
          :isExpanded="isExpanded"
        />
      </template>
    </div>
    <VcIcon
      class="self-center justify-self-center text-[#a1c0d4] cursor-pointer mr-l hover:text-[#7ea8c4]"
      :icon="`fas fa-chevron-${isExpanded ? 'up' : 'down'}`"
      @click="toggleToolbar"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import VcBladeToolbarButton from "./_internal/vc-blade-toolbar-button/vc-blade-toolbar-button.vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

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

function isToolbarVisible() {
  const visibleItems = (props.items as { isVisible: boolean }[]).filter(
    (item) => item.isVisible === undefined || item.isVisible
  );
  return !!visibleItems.length;
}
</script>

<style lang="less">
:root {
  --blade-toolbar-height: 36px;
  --blade-toolbar-height-expanded: 50px;
  --blade-toolbar-background-color: #ffffff;
}
</style>
