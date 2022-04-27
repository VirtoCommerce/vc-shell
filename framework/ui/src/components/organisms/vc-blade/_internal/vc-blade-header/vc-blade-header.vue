<template>
  <div
    class="vc-flex-shrink_0 h-[var(--blade-header-height)] bg-[color:var(--blade-header-background-color)] flex items-center py-0 px-4 border-solid border-b border-b-[color:#eaedf3]"
  >
    <div v-if="icon" class="text-[color:var(--blade-header-icon-color)] mr-3">
      <VcIcon :icon="icon" size="xxl"></VcIcon>
    </div>

    <div class="overflow-hidden grow">
      <div
        class="text-[color:var(--blade-header-title-color)] text-lg text-ellipsis overflow-hidden whitespace-nowrap"
        :class="{
          '!text-[length:var(--blade-header-title-font-size)] font-medium':
            !subtitle,
        }"
      >
        {{ title }}
      </div>
      <div
        v-if="subtitle"
        class="text-[color:var(--blade-header-subtitle-color)] text-xs mt-1"
      >
        {{ subtitle }}
      </div>
    </div>

    <div v-if="$slots['actions']">
      <slot name="actions"></slot>
    </div>

    <div v-if="!$isMobile.value" class="flex items-center">
      <template v-if="expandable">
        <div
          v-if="expanded"
          class="text-[color:var(--blade-header-button-color)] ml-4 cursor-pointer hover:text-[color:var(--blade-header-button-color-hover)]"
          @click="onCollapse"
        >
          <VcIcon icon="fas fa-window-minimize" size="s"></VcIcon>
        </div>
        <div v-else class="vc-blade-header__button" @click="onExpand">
          <VcIcon icon="fas fa-window-maximize" size="s"></VcIcon>
        </div>
      </template>
      <div
        v-if="closable"
        class="text-[color:var(--blade-header-button-color)] ml-4 cursor-pointer hover:text-[color:var(--blade-header-button-color-hover)]"
        @click="onClose"
      >
        <VcIcon icon="fas fa-times"></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VcIcon from "../../../../atoms/vc-icon/vc-icon.vue";

const props = defineProps({
  expandable: {
    type: Boolean,
    default: false,
  },

  expanded: {
    type: Boolean,
    default: false,
  },

  closable: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: undefined,
  },

  subtitle: {
    type: String,
    default: undefined,
  },

  icon: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["close", "expand", "collapse"]);

function onExpand(): void {
  if (props.expandable) {
    emit("expand");
  }
}

function onCollapse(): void {
  if (props.expandable) {
    emit("collapse");
  }
}

function onClose(): void {
  if (props.closable) {
    emit("close");
  }
}
</script>

<style lang="less">
:root {
  --blade-header-height: 50px;
  --blade-header-background-color: #ffffff;

  --blade-header-button-color: #a1c0d4;
  --blade-header-button-color-hover: #7ea8c4;

  --blade-header-icon-color: #a1c0d4;

  --blade-header-title-font-size: 19px;
  --blade-header-title-color: #2e3d4e;

  --blade-header-subtitle-color: #a1c0d4;
}
</style>
