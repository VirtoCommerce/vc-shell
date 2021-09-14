<template>
  <div class="vc-autocomplete" :class="{ 'vc-autocomplete_opened': opened }">
    <!-- Autocomplete label -->
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </vc-label>

    <!-- Autocomplete field -->
    <div class="vc-autocomplete__field-wrapper vc-flex vc-flex-align_stretch">
      <input
        class="vc-autocomplete__field vc-padding-horizontal_m"
        :placeholder="placeholder"
        :value="modelValue"
        @click="openDropdown"
        readonly
      />

      <!-- Autocomplete chevron -->
      <div
        class="
          vc-autocomplete__chevron
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
      >
        <vc-icon size="s" icon="fas fa-chevron-down"></vc-icon>
      </div>

      <div
        v-if="opened"
        class="vc-autocomplete__dropdown"
        v-click-outside="closeDropdown"
      >
        <input ref="search" class="vc-autocomplete__search" />

        <vc-container :no-padding="true">
          <div
            class="vc-autocomplete__item"
            v-for="(item, i) in options"
            :key="i"
          >
            <slot name="item">{{ item.title }}</slot>
          </div>
        </vc-container>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";
import { clickOutside } from "../../../directives";

export default defineComponent({
  name: "VcAutocomplete",

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
  },

  emits: ["update:modelValue"],

  setup() {
    const opened = ref(false);
    const search = ref();

    return {
      opened,
      search,
      closeDropdown: () => {
        opened.value = false;
      },
      openDropdown: () => {
        opened.value = true;
        nextTick(() => {
          search.value.focus();
        });
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --autocomplete-height: 38px;
  --autocomplete-border-radius: 3px;
  --autocomplete-border-color: #d3dbe9;
  --autocomplete-background-color: #ffffff;
  --autocomplete-placeholder-color: #a5a5a5;
  --autocomplete-chevron-color: #43b0e6;
  --autocomplete-chevron-color-hover: #319ed4;
}

.vc-autocomplete {
  box-sizing: border-box;

  &__field-wrapper {
    position: relative;
    box-sizing: border-box;
    border: 1px solid var(--autocomplete-border-color);
    border-radius: var(--autocomplete-border-radius);
    background-color: var(--autocomplete-background-color);
  }

  &__field {
    width: 100%;
    appearance: none;
    border: none;
    outline: none;
    height: var(--autocomplete-height);
    box-sizing: border-box;

    &:invalid {
      color: var(--autocomplete-placeholder-color);
    }
  }

  &__chevron {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    cursor: pointer;
    color: var(--autocomplete-chevron-color);

    &:hover {
      color: var(--autocomplete-chevron-color-hover);
    }
  }

  &_opened &__chevron {
    transform: rotate(180deg);
  }

  &__dropdown {
    display: none;
  }

  &_opened &__field-wrapper {
    border-radius: var(--autocomplete-border-radius)
      var(--autocomplete-border-radius) 0 0;
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
    top: var(--autocomplete-height);
    background-color: var(--autocomplete-background-color);
    border: 1px solid var(--autocomplete-border-color);
    border-top: 1px solid var(--autocomplete-background-color);
    border-radius: 0 0 var(--autocomplete-border-radius)
      var(--autocomplete-border-radius);
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
    height: 36px;
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);
    border-radius: 3px;

    &:hover {
      background-color: #dfeef9;
    }
  }
}
</style>
