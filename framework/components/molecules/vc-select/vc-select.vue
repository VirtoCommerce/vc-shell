<template>
  <div
    class="vc-select box-border"
    :class="{
      'vc-select_opened': isOpened,
      'vc-select_error': errorMessage,
      'vc-select_disabled': isDisabled,
    }"
  >
    <!-- Select label -->
    <VcLabel v-if="label" class="mb-2" :required="isRequired">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Select field -->
    <div
      class="vc-select__field-wrapper relative box-border border border-solid border-[color:var(--select-border-color)] rounded-[var(--select-border-radius)] bg-[color:var(--select-background-color)] flex items-stretch"
      ref="inputFieldWrapRef"
    >
      <div
        class="w-full appearance-none border-none outline-none min-h-[var(--select-height)] px-3 flex items-center w-full box-border box-border cursor-pointer invalid:text-[color:var(--select-placeholder-color)] overflow-hidden"
        @click.stop="toggleDropdown"
        ref="dropdownToggleRef"
      >
        <div v-if="!selectedItem" class="text-[#a5a5a5]">
          {{ placeholder }}
        </div>
        <slot
          v-else-if="$slots['selectedItem']"
          name="selectedItem"
          :item="selectedItem"
        ></slot>
        <slot v-else name="item" :item="selectedItem">
          {{ selectedItem[displayProperty] }}
        </slot>
      </div>

      <!-- Select chevron -->
      <div
        v-if="!isDisabled"
        class="vc-select__chevron absolute right-0 top-0 h-full cursor-pointer px-3 flex items-center text-[color:var(--select-chevron-color)] hover:text-[color:var(--select-chevron-color-hover)]"
        @click.stop="toggleDropdown"
      >
        <VcIcon size="s" icon="fas fa-chevron-down"></VcIcon>
      </div>
      <teleport to="#app">
        <div
          v-if="isOpened"
          class="flex flex-col box-border max-h-[300px] z-10 overflow-hidden absolute bg-[color:var(--select-background-color)] border border-solid border-[color:var(--select-border-color)] border-t-[color:var(--select-background-color)] rounded-b-[var(--select-border-radius)] p-2"
          ref="dropdownRef"
          v-click-outside="closeDropdown"
        >
          <input
            v-if="isSearchable"
            ref="search"
            class="w-full box-border border border-solid border-[#eaecf2] rounded-[4px] h-[32px] leading-[32px] outline-none mb-3 px-2"
            @input="onSearch"
          />

          <VcContainer :no-padding="true">
            <div
              class="flex items-center min-h-[36px] px-2 rounded-[3px] cursor-pointer hover:bg-[#eff7fc]"
              v-for="(item, i) in options"
              :key="i"
              @click="onItemSelect(item)"
            >
              <slot name="item" :item="item">{{ item[displayProperty] }}</slot>
            </div>
            <div v-show="hasNextPage" ref="load" class="text-center">
              Loading...
            </div>
          </VcContainer>
        </div>
      </teleport>

      <!-- Input clear button -->
      <div
        v-if="clearable && modelValue && !isDisabled"
        class="vc-select__clear"
        @click="onReset"
      >
        <VcIcon size="s" icon="fas fa-times"></VcIcon>
      </div>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="text-[color:var(--select-border-color-error)] mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, computed, watch, getCurrentInstance } from "vue";
import { useField } from "vee-validate";
import { VcIcon, VcLabel, VcContainer } from "@/components";
import { createPopper, Instance, State } from "@popperjs/core";
import { clickOutside as vClickOutside } from "@/core/directives";

const props = defineProps({
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

  clearable: {
    type: Boolean,
    default: true,
  },

  optionsTotal: {
    type: Number,
    default: 0,
  },

  onInfiniteScroll: {
    type: Function,
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue", "change", "close", "search"]);

const instance = getCurrentInstance();
const isOpened = ref(false);
const search = ref();
const popper = ref<Instance>();
const dropdownToggleRef = ref();
const dropdownRef = ref();
const inputFieldWrapRef = ref();
const load = ref();
const observer = new IntersectionObserver(infiniteScroll);

const selectedItem = computed(
  () =>
    (props.options as Record<string, unknown>[])?.find(
      (item) => item[props.keyProperty] === props.modelValue
    ) || props.initialItem
);

const hasNextPage = computed(() => {
  return props.options.length < props.optionsTotal;
});

// Prepare field-level validation
const { errorMessage, handleChange } = useField(
  `${instance?.uid || props.name}`,
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

function closeDropdown() {
  observer.disconnect();
  isOpened.value = false;
  popper.value?.destroy();
  inputFieldWrapRef.value.style.borderRadius = "var(--select-border-radius)";
  emit("close");
}

async function toggleDropdown() {
  if (!props.isDisabled) {
    if (isOpened.value) {
      closeDropdown();
    } else {
      isOpened.value = true;
      if (hasNextPage.value) {
        await nextTick();
        observer.observe(load.value);
      }
      await nextTick(() => {
        search?.value?.focus();
        popper.value = createPopper(
          dropdownToggleRef.value,
          dropdownRef.value,
          {
            placement: "bottom",
            modifiers: [
              {
                name: "flip",
                options: {
                  fallbackPlacements: ["top", "bottom"],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  mainAxis: false,
                },
              },
              {
                name: "sameWidthChangeBorders",
                enabled: true,
                phase: "beforeWrite",
                requires: ["computeStyles"],
                fn: ({ state }: { state: State }) => {
                  const placement = state.placement;
                  if (placement === "top") {
                    state.styles.popper.borderTop =
                      "1px solid var(--select-border-color)";
                    state.styles.popper.borderBottom =
                      "1px solid var(--select-background-color)";
                    state.styles.popper.borderRadius =
                      "var(--select-border-radius) var(--select-border-radius) 0 0";
                    inputFieldWrapRef.value.style.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";
                  } else {
                    state.styles.popper.borderBottom =
                      "1px solid var(--select-border-color)";
                    state.styles.popper.borderTop =
                      "1px solid var(--select-background-color)";
                    state.styles.popper.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";

                    if (inputFieldWrapRef.value) {
                      inputFieldWrapRef.value.style.borderRadius =
                        "var(--select-border-radius) var(--select-border-radius) 0 0";
                    }
                  }
                  state.styles.popper.width = `${
                    state.rects.reference.width + 2
                  }px`;
                },
                effect: ({ state }: { state: State }) => {
                  const ref = state.elements.reference as HTMLElement;
                  const placement = state.placement;
                  if (placement === "top") {
                    state.elements.popper.style.borderTop =
                      "1px solid var(--select-border-color)";
                    state.elements.popper.style.borderBottom =
                      "1px solid var(--select-background-color)";
                    state.elements.popper.style.borderRadius =
                      "var(--select-border-radius) var(--select-border-radius) 0 0";
                    inputFieldWrapRef.value.style.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";
                  } else {
                    state.elements.popper.style.borderBottom =
                      "1px solid var(--select-border-color)";
                    state.elements.popper.style.borderTop =
                      "1px solid var(--select-background-color)";
                    state.elements.popper.style.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";

                    if (inputFieldWrapRef.value) {
                      inputFieldWrapRef.value.style.borderRadius =
                        "var(--select-border-radius) var(--select-border-radius) 0 0";
                    }
                  }
                  state.elements.popper.style.width = `${
                    ref.offsetWidth + 2
                  }px`;
                },
              },
              {
                name: "offset",
                options: {
                  offset: [0, 0],
                },
              },
            ],
          }
        );
      });
    }
  }
}

function onItemSelect(item: { [x: string]: string }) {
  emit("update:modelValue", item[props.keyProperty]);
  emit("change", item[props.keyProperty]);
  emit("close");
  isOpened.value = false;
}

function onSearch(event: InputEvent) {
  emit("search", (event.target as HTMLInputElement).value);
}

// Handle input event to propertly reset value and emit changes
function onReset() {
  emit("update:modelValue", "");
}

async function infiniteScroll([
  { isIntersecting, target },
]: IntersectionObserverEntry[]) {
  if (
    isIntersecting &&
    props.onInfiniteScroll &&
    typeof props.onInfiniteScroll === "function"
  ) {
    const ul = (target as HTMLElement).offsetParent as Element;
    const scrollTop = (target as HTMLElement).offsetParent?.scrollTop;
    await props.onInfiniteScroll();
    await nextTick();
    ul.scrollTop = scrollTop as number;
  }
}
</script>

<style lang="scss">
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
  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply bg-[color:var(--select-background-color-disabled)] text-[#424242];
  }

  &_error &__field-wrapper {
    @apply border border-solid border-[color:var(--select-border-color-error)];
  }

  &_disabled &__field {
    @apply cursor-auto;
  }

  &_opened &__chevron {
    @apply rotate-180;
  }

  &_opened &__field-wrapper {
    @apply rounded-t-[var(--select-border-radius)];
  }

  &__clear {
    @apply cursor-pointer text-[color:var(--input-clear-color)] hover:text-[color:var(--input-clear-color-hover)] pr-10 pl-3 flex items-center;
  }
}
</style>
