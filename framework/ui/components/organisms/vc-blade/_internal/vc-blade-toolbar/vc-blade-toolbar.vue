<template>
  <div
    v-if="isToolbarVisible()"
    class="tw-h-[var(--blade-toolbar-height)] tw-bg-[color:var(--blade-toolbar-background-color)] tw-border-b-[color:#eaedf3] tw-border-solid tw-border-b tw-flex tw-box-border tw-w-full tw-content-center tw-items-stretch tw-shrink-0"
    :class="{ '!tw-h-[var(--blade-toolbar-height-expanded)]': isExpanded }"
  >
    <div class="tw-grow tw-basis-0 tw-flex tw-content-start tw-items-center tw-overflow-x-auto tw-px-2">
      <template
        v-for="item in items"
        :key="item.id"
      >
        <VcBladeToolbarButton
          v-if="item.isVisible === undefined || item.isVisible"
          :is-expanded="isExpanded"
          :icon="item.icon"
          :title="item.title"
          :options="item.options"
          :disabled="item.disabled as boolean"
          :dropdown-items="item.dropdownItems"
          :click-handler="item.clickHandler"
        />
      </template>
    </div>
    <VcIcon
      class="tw-self-center tw-justify-self-center tw-text-[#a1c0d4] tw-cursor-pointer tw-mr-4 hover:tw-text-[#7ea8c4]"
      :icon="`fas fa-chevron-${isExpanded ? 'up' : 'down'}`"
      @click="toggleToolbar"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { IBladeToolbar } from "./../../../../../../core/types";
import { ref } from "vue";
import VcBladeToolbarButton from "./_internal/vc-blade-toolbar-button/vc-blade-toolbar-button.vue";
import { VcIcon } from "./../../../../";

export interface Props {
  items: IBladeToolbar[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const isExpanded = ref(true);
try {
  isExpanded.value = localStorage.getItem("VC_BLADE_TOOLBAR_IS_EXPANDED") === "true";
} catch (err) {
  isExpanded.value = true;
}

function toggleToolbar() {
  isExpanded.value = !isExpanded.value;
  localStorage.setItem("VC_BLADE_TOOLBAR_IS_EXPANDED", isExpanded.value.toString());
}

function isToolbarVisible() {
  const visibleItems = (props.items as { isVisible: boolean }[]).filter(
    (item) => item.isVisible === undefined || item.isVisible
  );
  return !!visibleItems.length;
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-height: 36px;
  --blade-toolbar-height-expanded: 50px;
  --blade-toolbar-background-color: #ffffff;
}
</style>
