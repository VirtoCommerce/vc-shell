<template>
  <div
    class="vc-blade-toolbar-button"
    :class="{ 'vc-blade-toolbar-button_disabled': disabled }"
    @click="onClick"
  >
    <vc-icon
      class="vc-blade-toolbar-button__icon"
      :icon="icon"
      size="m"
    ></vc-icon>
    <div class="vc-blade-toolbar-button__title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  components: {
    VcIcon,
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
      default: "question-circle",
    },

    title: {
      type: String,
      default: undefined,
    },

    clickHandler: {
      type: Function,
      default: undefined,
    },
  },

  setup(props, { emit }) {
    return {
      onClick(): void {
        if (props.clickHandler) {
          props.clickHandler();
        } else {
          emit("click");
        }
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --blade-toolbar-button-color: #319ed4;
  --blade-toolbar-button-color-hover: #257fad;
  --blade-toolbar-button-color-disabled: #bdd1df;

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
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 var(--padding-s);
  color: var(--blade-toolbar-button-color);
  background-color: var(--blade-toolbar-button-background-color);
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    color: var(--blade-toolbar-button-color-hover);
    background-color: var(--blade-toolbar-button-background-color-hover);
  }

  &_disabled,
  &_disabled:hover {
    color: var(--blade-toolbar-button-color-disabled);
    background-color: var(--blade-toolbar-button-background-color-disabled);
    cursor: default;
  }

  &__title {
    font-size: var(--font-size-s);
    white-space: nowrap;
    margin-top: var(--margin-xs);
  }
}
</style>
