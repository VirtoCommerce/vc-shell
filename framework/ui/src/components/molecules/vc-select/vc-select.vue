<template>
  <div class="vc-select" :class="{ 'vc-select_opened': opened }">
    <!-- Select label -->
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </vc-label>

    <!-- Select field -->
    <div
      class="vc-select__field-wrapper vc-flex vc-flex-align_stretch"
      v-click-outside="closeDropdown"
    >
      <input
        class="vc-select__field vc-padding-horizontal_m"
        :placeholder="placeholder"
        :value="modelValue && modelValue.title"
        @click="openDropdown"
        readonly
      />

      <!-- Select chevron -->
      <div
        class="
          vc-select__chevron
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
        @click="opened = !opened"
      >
        <vc-icon size="s" icon="fas fa-chevron-down"></vc-icon>
      </div>

      <div v-if="opened" class="vc-select__dropdown">
        <vc-container :no-padding="true">
          <div
            class="vc-select__item"
            v-for="(item, i) in options"
            :key="i"
            @click="onItemSelect"
          >
            <slot name="item" :item="item">{{ item.title }}</slot>
          </div>
        </vc-container>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";
import { clickOutside } from "../../../directives";

interface IOptions {
  id: string;
  title: string;
}

export default defineComponent({
  name: "VcSelect",

  components: {
    VcIcon,
    VcLabel,
    VcContainer,
  },

  directives: {
    clickOutside,
  },

  props: {
    modelValue: {
      type: String,
      default: undefined,
    },

    placeholder: {
      type: String,
      default: "Click to select...",
    },

    options: {
      type: Array,
      default: () => [],
    },

    required: {
      type: Boolean,
      default: false,
    },

    label: {
      type: String,
      default: undefined,
    },

    tooltip: {
      type: String,
      default: undefined,
    },

    searchString: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue", "change", "close"],

  setup(props, { emit }) {
    const opened = ref(false);

    return {
      opened,
      closeDropdown: () => {
        opened.value = false;
        emit("close");
      },
      openDropdown: () => {
        opened.value = true;
      },
      onItemSelect: (item: unknown) => {
        emit("update:modelValue", item);
        emit("change", item);
        emit("close");
        opened.value = false;
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --select-height: 38px;
  --select-border-radius: 3px;
  --select-border-color: #d3dbe9;
  --select-background-color: #ffffff;
  --select-placeholder-color: #a5a5a5;
  --select-chevron-color: #43b0e6;
  --select-chevron-color-hover: #319ed4;
}

.vc-select {
  box-sizing: border-box;

  &__field-wrapper {
    position: relative;
    box-sizing: border-box;
    border: 1px solid var(--select-border-color);
    border-radius: var(--select-border-radius);
    background-color: var(--select-background-color);
  }

  &__field {
    width: 100%;
    appearance: none;
    border: none;
    outline: none;
    height: var(--select-height);
    box-sizing: border-box;

    &:invalid {
      color: var(--select-placeholder-color);
    }
  }

  &__chevron {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    cursor: pointer;
    color: var(--select-chevron-color);

    &:hover {
      color: var(--select-chevron-color-hover);
    }
  }

  &_opened &__chevron {
    transform: rotate(180deg);
  }

  &__dropdown {
    display: none;
  }

  &_opened &__field-wrapper {
    border-radius: var(--select-border-radius) var(--select-border-radius) 0 0;
  }

  &_opened &__dropdown {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    max-height: 300px;
    z-index: 10;
    overflow: hidden;
    position: absolute;
    left: -1px;
    right: -1px;
    top: var(--select-height);
    background-color: var(--select-background-color);
    border: 1px solid var(--select-border-color);
    border-top: 1px solid var(--select-background-color);
    border-radius: 0 0 var(--select-border-radius) var(--select-border-radius);
    padding: var(--padding-s);
  }

  &__search {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #eaecf2;
    border-radius: 4px;
    height: 32px;
    line-height: 32px;
    outline: none;
    margin-bottom: var(--margin-m);
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);
  }

  &__item {
    display: flex;
    align-items: center;
    min-height: 36px;
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: #dfeef9;
    }
  }
}
</style>
