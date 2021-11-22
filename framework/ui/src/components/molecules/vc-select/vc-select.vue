<template>
  <div
    class="vc-select"
    :class="{
      'vc-select_opened': isOpened,
      'vc-select_error': errorMessage,
      'vc-select_disabled': isDisabled,
    }"
  >
    <!-- Select label -->
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="isRequired">
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
      <div
        class="
          vc-select__field
          vc-padding_m
          vc-flex
          vc-flex-align_center
          vc-fill_width
        "
        @click="toggleDropdown"
      >
        <div v-if="!selectedItem" class="vc-select__field-placeholder">
          {{ placeholder }}
        </div>
        <slot v-else name="item" :item="selectedItem">
          {{ selectedItem[displayProperty] }}
        </slot>
      </div>

      <!-- Select chevron -->
      <div
        v-if="!isDisabled"
        class="
          vc-select__chevron
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
        @click="toggleDropdown"
      >
        <vc-icon size="s" icon="fas fa-chevron-down"></vc-icon>
      </div>

      <div v-if="isOpened" class="vc-select__dropdown">
        <input
          v-if="isSearchable"
          ref="search"
          class="vc-select__search"
          @input="onSearch"
        />

        <vc-container :no-padding="true">
          <div
            class="vc-select__item"
            v-for="(item, i) in options"
            :key="i"
            @click="onItemSelect(item)"
          >
            <slot name="item" :item="item">{{ item[displayProperty] }}</slot>
          </div>
        </vc-container>
      </div>
    </div>

    <slot v-if="errorMessage" name="error">
      <vc-hint class="vc-select__error vc-margin-top_xs">
        {{ errorMessage }}
      </vc-hint>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, computed, watch } from "vue";
import { useField } from "vee-validate";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";
import { clickOutside } from "../../../directives";

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
      type: [String, Number],
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

    isRequired: {
      type: Boolean,
      default: false,
    },

    isDisabled: {
      type: Boolean,
      default: false,
    },

    isSearchable: {
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

    keyProperty: {
      type: String,
      default: "id",
    },

    displayProperty: {
      type: String,
      default: "title",
    },

    initialItem: {
      type: Object,
      default: undefined,
    },

    name: {
      type: String,
      default: "Field",
    },
  },

  emits: ["update:modelValue", "change", "close", "search"],

  setup(props, { emit }) {
    const isOpened = ref(false);
    const search = ref();
    const selectedItem = computed(
      () =>
        (props.options as Record<string, unknown>[])?.find(
          (item) => item[props.keyProperty] === props.modelValue
        ) || props.initialItem
    );

    // Prepare field-level validation
    const { errorMessage, handleChange } = useField(
      props.name,
      props.isRequired ? "required" : "",
      {
        initialValue: props.modelValue,
      }
    );

    watch(
      () => props.modelValue,
      (value) => {
        handleChange(value);
      }
    );

    return {
      search,
      errorMessage,
      isOpened,
      selectedItem,
      closeDropdown: () => {
        isOpened.value = false;
        emit("close");
      },
      toggleDropdown: () => {
        if (!props.isDisabled) {
          if (isOpened.value) {
            isOpened.value = false;
            emit("close");
          } else {
            isOpened.value = true;
            nextTick(() => {
              search?.value?.focus();
            });
          }
        }
      },
      onItemSelect: (item: { [x: string]: string }) => {
        emit("update:modelValue", item[props.keyProperty]);
        emit("change", item[props.keyProperty]);
        emit("close");
        isOpened.value = false;
      },
      onSearch: (event: InputEvent) => {
        emit("search", (event.target as HTMLInputElement).value);
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
  --select-border-color-error: #f14e4e;
  --select-background-color: #ffffff;
  --select-background-color-disabled: #fafafa;
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

  &_disabled &__field-wrapper {
    background-color: var(--select-background-color-disabled);
  }

  &_error &__field-wrapper {
    border: 1px solid var(--select-border-color-error);
  }

  &__error {
    color: var(--select-border-color-error);
  }

  &__field {
    width: 100%;
    appearance: none;
    border: none;
    outline: none;
    min-height: var(--select-height);
    box-sizing: border-box;
    cursor: pointer;

    &:invalid {
      color: var(--select-placeholder-color);
    }

    &-placeholder {
      color: #a5a5a5;
    }
  }

  &_disabled &__field {
    cursor: auto;
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
    top: 100%;
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
      background-color: #eff7fc;
    }
  }
}
</style>
