<template>
  <div
    v-if="isToolbarVisible()"
    class="tw-h-[var(--blade-toolbar-height)] tw-bg-[color:var(--blade-toolbar-background-color)] tw-border-b-[color:var(--blade-toolbar-border-color)] tw-border-solid tw-border-b tw-flex tw-box-border tw-w-full tw-content-center tw-items-stretch tw-shrink-0"
    :class="{ '!tw-h-[var(--blade-toolbar-height-expanded)]': isExpanded }"
  >
    <div class="tw-grow tw-basis-0 tw-flex tw-content-start tw-items-center tw-overflow-x-auto tw-px-2">
      <template
        v-for="item in items"
        :key="item.id"
      >
        <VcBladeToolbarButton
          v-if="$hasAccess(item.permissions) && (item.isVisible === undefined || item.isVisible)"
          :id="item.id"
          :is-expanded="isExpanded"
          :icon="item.icon"
          :title="unref(item.title)"
          :disabled="item.disabled as boolean"
          :separator="item.separator"
          :dropdown-items="item.dropdownItems"
          :click-handler="item.clickHandler"
        />
      </template>
    </div>
    <VcIcon
      class="tw-self-center tw-justify-self-center tw-text-[color:var(--blade-toolbar-icon-color)] tw-cursor-pointer tw-mr-4 hover:tw-text-[color:var(--blade-toolbar-icon-hover-color)]"
      :icon="`fas fa-chevron-${isExpanded ? 'up' : 'down'}`"
      @click="toggleToolbar"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { IBladeToolbar } from "./../../../../../../core/types";
import { ref, unref } from "vue";
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
    (item) => item.isVisible === undefined || item.isVisible,
  );
  return !!visibleItems.length;
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-height: 36px;
  --blade-toolbar-height-expanded: 50px;
  --blade-toolbar-background-color: var(--additional-50);
  --blade-toolbar-border-color: var(--secondary-100);
  --blade-toolbar-icon-color: var(--primary-500);
  --blade-toolbar-icon-hover-color: var(--primary-600);
}
</style>
