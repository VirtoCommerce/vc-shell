<template>
  <div class="vc-select box-border">
    <!-- Select label -->
    <VcLabel v-if="label" class="mb-2" :required="isRequired">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>
    <vSelect
      class="vc-select"
      :options="options"
      :label="displayProperty"
      @option:selected="onItemSelect"
      :clearable="clearable"
      :modelValue="selectedItem"
      :searchable="false"
      ref="select"
      @open="onOpen"
      @close="onClose"
    >
      <template #list-header v-if="isSearchable">
        <li>
          <input
            ref="search"
            class="w-full box-border border border-solid border-[#eaecf2] rounded-[4px] h-[32px] leading-[32px] outline-none mb-3 px-2"
            @input="onSearch"
            @click="handleInputFocus"
          />
        </li>
      </template>
      <template #open-indicator="{ attributes }">
        <VcIcon
          v-bind="attributes"
          size="s"
          icon="fas fa-chevron-down"
          class="text-[color:var(--select-chevron-color)]"
        ></VcIcon>
      </template>
      <template #option="option">
        <div v-if="!option" class="text-[#a5a5a5]">
          {{ placeholder }}
        </div>
        <slot
          v-else-if="$slots['selectedItem']"
          name="selectedItem"
          :item="option"
        ></slot>
        <slot v-else name="item" :item="option">
          {{ option[displayProperty] }}
        </slot>
      </template>
      <template #selected-option="option">
        <div v-if="!option" class="text-[#a5a5a5]">
          {{ placeholder }}
        </div>
        <slot
          v-else-if="$slots['selectedItem']"
          name="selectedItem"
          :item="option"
        ></slot>
        <slot v-else name="item" :item="option">
          {{ option[displayProperty] }}
        </slot>
      </template>
      <template #list-footer>
        <li v-show="hasNextPage" ref="load" class="loader">
          Loading more options...
        </li>
      </template>
    </vSelect>
    <slot v-if="errorMessage" name="error">
      <VcHint class="text-[color:var(--select-border-color-error)] mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import { useField } from "vee-validate";
import { computed, getCurrentInstance, nextTick, ref, watch } from "vue";

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
const search = ref();
const select = ref();
const load = ref();
const observer = new IntersectionObserver(infiniteScroll);

// Prepare field-level validation
const { errorMessage, handleChange } = useField(
  `${instance?.uid || props.name}`,
  props.isRequired ? "required" : "",
  {
    initialValue: props.modelValue,
  }
);

const selectedItem = computed(
  () =>
    (props.options as Record<string, unknown>[])?.find(
      (item) => item[props.keyProperty] === props.modelValue
    ) || props.initialItem
);

const hasNextPage = computed(() => {
  return props.options.length < props.optionsTotal;
});

watch(
  () => props.modelValue,
  (value) => {
    handleChange(value);
  }
);

function onItemSelect(item: { [x: string]: string }) {
  emit("update:modelValue", item[props.keyProperty]);
  emit("change", item[props.keyProperty]);
  emit("close");
}

function onSearch(event: InputEvent) {
  emit("search", (event.target as HTMLInputElement).value);
}

function handleInputFocus() {
  search.value.focus();
  select.value.open = true;
}

async function infiniteScroll([
  { isIntersecting, target },
]: IntersectionObserverEntry[]) {
  console.log(isIntersecting);
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

async function onOpen() {
  if (hasNextPage.value) {
    await nextTick();
    observer.observe(load.value);
  }
}

function onClose() {
  observer.disconnect();
}
</script>

<style lang="scss">
:root {
  --vs-dropdown-option--active-bg: #eff7fc;
  --vs-dropdown-option--active-color: inherit;
  --vs-dropdown-box-shadow: none;
  --vs-dropdown-option-padding: 0 0.5rem;

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
  .vs--single.vs--loading .vs__selected,
  .vs--single.vs--open .vs__selected {
    opacity: 1;
    position: static;
  }

  .vs__dropdown-toggle {
    @apply relative box-border border border-solid border-[color:var(--select-border-color)] rounded-[var(--select-border-radius)] bg-[color:var(--select-background-color)] flex items-stretch;
  }

  .vs__dropdown-menu {
    @apply flex flex-col box-border max-h-[300px] z-10 overflow-hidden absolute bg-[color:var(--select-background-color)] border border-solid border-[color:var(--select-border-color)] border-t-[color:var(--select-background-color)] rounded-b-[var(--select-border-radius)] p-2;
  }
}
</style>
