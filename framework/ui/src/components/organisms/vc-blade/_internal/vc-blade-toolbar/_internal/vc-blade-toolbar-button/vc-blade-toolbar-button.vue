<template>
  <div
    class="vc-blade-toolbar-button"
    :class="{ 'vc-blade-toolbar-button_disabled': disabled || isWaiting }"
    @click="onClick"
    :title="title"
  >
    <div ref="dropButtonRef">
      <div class="vc-blade-toolbar-button__wrap" ref="bladeDropToggle">
        <VcIcon
          class="vc-blade-toolbar-button__icon"
          :icon="icon"
          size="m"
        ></VcIcon>
        <div v-if="isExpanded" class="vc-blade-toolbar-button__title">
          {{ title }}
        </div>
      </div>
      <teleport to="#app">
        <div
          class="vc-blade-toolbar-button__dropdown"
          v-if="isDropActive"
          ref="bladeDropRef"
        >
          <div
            class="vc-blade-toolbar-button__dropdown-item"
            v-for="(item, i) in dropdownItems"
            :key="i"
            @click="handleDropItemClick(item)"
          >
            <VcIcon
              :icon="item.icon"
              class="vc-blade-toolbar-button__dropdown-item-icon vc-margin-right_s"
            />
            {{ item.title }}
          </div>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, PropType } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import VcIcon from "../../../../../../atoms/vc-icon/vc-icon.vue";
import { createPopper, Instance } from "@popperjs/core";
import { IBladeDropdownItem } from "../../../../../../../typings";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },

  isExpanded: {
    type: Boolean,
    default: true,
  },

  icon: {
    type: String,
    default: "fas fa-question-circle",
  },

  title: {
    type: String,
    default: undefined,
  },

  dropdownItems: {
    type: Array as PropType<IBladeDropdownItem[]>,
    default: () => [],
  },

  clickHandler: {
    type: Function,
    default: undefined,
  },
});
const emit = defineEmits(["click"]);

const popper = ref<Instance>();
const isWaiting = ref(false);
const isDropActive = ref(false);
const bladeDropToggle = ref();
const dropButtonRef = ref();
const bladeDropRef = ref();

async function onClick(): Promise<void> {
  console.debug("vc-blade-toolbar-item#onClick()");

  if (!props.disabled && !isWaiting.value) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      isWaiting.value = true;
      try {
        await props.clickHandler();
      } finally {
        isWaiting.value = false;
      }
    } else if (props.dropdownItems?.length) {
      toggleDropdown();
    } else {
      emit("click");
    }
  }
}

function toggleDropdown() {
  if (props.dropdownItems?.length) {
    if (isDropActive.value) {
      isDropActive.value = false;
      popper.value?.destroy();
    } else {
      isDropActive.value = true;
      nextTick(() => {
        popper.value = createPopper(bladeDropToggle.value, bladeDropRef.value, {
          placement: "bottom",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [70, 5],
              },
            },
          ],
        });
      });
    }
  }
}

function handleDropItemClick(item: IBladeDropdownItem) {
  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler();
    toggleDropdown();
  }
}
</script>

<style lang="less">
:root {
  --blade-toolbar-button-title-color: #465769;
  --blade-toolbar-button-title-color-hover: #465769;
  --blade-toolbar-button-title-color-disabled: #9fa2a6;

  --blade-toolbar-button-icon-color: #319ed4;
  --blade-toolbar-button-icon-color-hover: #257fad;
  --blade-toolbar-button-icon-color-disabled: #d2d4d7;

  --blade-toolbar-button-background-color: var(
    --blade-toolbar-background-color
  );
  --blade-toolbar-button-background-color-hover: var(
    --blade-toolbar-background-color
  );
  --blade-toolbar-button-background-color-disabled: var(
    --blade-toolbar-background-color
  );
}

.vc-blade-toolbar-button {
  padding: 0 var(--padding-s);
  background-color: var(--blade-toolbar-button-background-color);
  box-sizing: border-box;
  cursor: pointer;

  &__wrap {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  &__title {
    font-size: var(--font-size-s);
    white-space: nowrap;
    margin-top: var(--margin-xs);
    color: var(--blade-toolbar-button-title-color);
  }

  &__icon {
    color: var(--blade-toolbar-button-icon-color);
  }

  &__dropdown {
    position: absolute;
    background: white;
    z-index: 9999;
    box-shadow: 1px 1px 22px rgba(126, 142, 157, 0.2);
  }

  &__dropdown-item {
    padding: var(--padding-m);
    font-size: var(--font-size-l);
    color: #000000;
    border-left: 1px solid #eef0f2;
    border-bottom: 1px solid #eef0f2;
    background-color: white;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;

    &:hover {
      background-color: #eff7fc;
    }
  }

  &__dropdown-item-icon {
    color: #a9bfd2;
  }

  &:hover {
    background-color: var(--blade-toolbar-button-background-color-hover);

    .vc-blade-toolbar-button__title {
      color: var(--blade-toolbar-button-title-color-hover);
    }

    .vc-blade-toolbar-button__icon {
      color: var(--blade-toolbar-button-icon-color-hover);
    }
  }

  &_disabled,
  &_disabled:hover {
    background-color: var(--blade-toolbar-button-background-color-disabled);
    cursor: default;

    .vc-blade-toolbar-button__title {
      color: var(--blade-toolbar-button-title-color-disabled);
    }

    .vc-blade-toolbar-button__icon {
      color: var(--blade-toolbar-button-icon-color-disabled);
    }
  }
}
</style>
