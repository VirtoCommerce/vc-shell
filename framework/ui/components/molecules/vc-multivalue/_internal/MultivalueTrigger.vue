<template>
  <div
    ref="triggerRef"
    class="vc-multivalue__field-wrapper"
    :role="isDictionaryMode ? 'combobox' : undefined"
    :tabindex="isDictionaryMode ? 0 : undefined"
    :aria-expanded="isDictionaryMode ? isOpened : undefined"
    :aria-haspopup="isDictionaryMode ? 'listbox' : undefined"
    :aria-controls="isDictionaryMode && isOpened ? listboxId : undefined"
    :aria-labelledby="labelId"
    :aria-describedby="ariaDescribedBy"
    :aria-invalid="error || undefined"
  >
    <div
      v-if="$slots['prepend']"
      class="vc-multivalue__prepend"
    >
      <slot name="prepend" />
    </div>

    <div class="vc-multivalue__control">
      <div class="vc-multivalue__content">
        <!-- Selected chips -->
        <div
          v-for="(item, i) in modelValue"
          :key="item?.[optionValue as keyof typeof item] ?? i"
          class="vc-multivalue__chip-wrapper"
        >
          <div
            v-if="item"
            class="vc-multivalue__chip"
          >
            <!-- Color square for color type -->
            <div
              v-if="type === 'color'"
              class="vc-multivalue__color-square"
              :style="{ backgroundColor: (item as any).colorCode || '#cccccc' }"
              @click="emit('openColorPicker', i)"
            >
              <input
                :ref="(el) => emit('setColorPickerRef', el as HTMLInputElement, i)"
                type="color"
                class="vc-multivalue__color-picker-hidden"
                :value="(item as any).colorCode || '#000000'"
                @change="(e) => emit('colorChange', e, i)"
              />
            </div>

            <slot
              name="selected-item"
              :value="formatValue(item)"
              :item="item"
              :index="i"
              :remove="() => emit('remove', i)"
            >
              <span class="vc-multivalue__chip-label">{{ formatValue(item) }}</span>
            </slot>
            <VcIcon
              v-if="!disabled"
              class="vc-multivalue__chip-remove"
              icon="lucide-x"
              size="xs"
              tabindex="0"
              role="button"
              aria-label="Delete item"
              @click="emit('remove', i)"
              @keydown.enter="emit('remove', i)"
              @keydown.space="emit('remove', i)"
            />
          </div>
        </div>

        <!-- Dictionary mode: Add button -->
        <template v-if="isDictionaryMode">
          <button
            class="vc-multivalue__add-button"
            :disabled="disabled"
            tabindex="0"
            type="button"
            @click.stop="emit('toggleDropdown')"
          >
            <VcIcon
              icon="lucide-plus"
              size="xs"
            />
            <span>{{ $t("COMPONENTS.MOLECULES.VC_MULTIVALUE.ADD") }}</span>
          </button>
        </template>

        <!-- Input mode: text input -->
        <template v-else>
          <input
            :value="inputValue"
            class="vc-multivalue__input"
            :placeholder="placeholder"
            :type="htmlInputType"
            :disabled="disabled"
            :aria-invalid="error || undefined"
            :aria-labelledby="labelId"
            :aria-describedby="ariaDescribedBy"
            tabindex="0"
            @input="emit('inputChange', ($event.target as HTMLInputElement).value)"
            @keypress.enter.stop.prevent="emit('inputSubmit', $event)"
            @blur="onInputBlur"
            @keydown="emit('keyDown', $event)"
            @focus="emit('focus')"
          />
        </template>
      </div>

      <!-- Clearable button -->
      <div
        v-if="clearable && modelValue && modelValue.length > 0 && !disabled"
        class="vc-multivalue__clear"
        role="button"
        aria-label="Clear all"
        tabindex="0"
        @click="emit('clearAll')"
        @keydown.enter="emit('clearAll')"
        @keydown.space="emit('clearAll')"
      >
        <VcIcon
          size="xs"
          icon="lucide-x"
        />
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="vc-multivalue__loading"
      >
        <VcIcon
          icon="lucide-loader-2"
          class="tw-animate-spin"
          size="m"
        />
      </div>
    </div>

    <div
      v-if="$slots['append']"
      class="vc-multivalue__append"
    >
      <slot name="append" />
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref } from "vue";
import { VcIcon } from "./../../../";

defineProps<{
  modelValue?: any[];
  isDictionaryMode: boolean;
  type: string;
  htmlInputType: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
  clearable?: boolean;
  optionValue: string;
  inputValue?: string;
  formatValue: (item: any) => any;
  isOpened?: boolean;
  labelId?: string;
  listboxId?: string;
  ariaDescribedBy?: string;
}>();

const emit = defineEmits<{
  remove: [index: number];
  toggleDropdown: [];
  inputSubmit: [event: KeyboardEvent | FocusEvent];
  inputChange: [value: string];
  keyDown: [event: KeyboardEvent];
  focus: [];
  blur: [];
  clearAll: [];
  openColorPicker: [index: number];
  setColorPickerRef: [el: HTMLInputElement, index: number];
  colorChange: [event: Event, index: number];
}>();

defineSlots<{
  "selected-item": (scope: { value: any; item: any; index: number; remove: () => void }) => any;
  prepend: (props: any) => any;
  append: (props: any) => any;
}>();

const triggerRef = ref<HTMLElement | null>(null);

function onInputBlur(e: FocusEvent) {
  emit("inputSubmit", e);
  emit("blur");
}

defineExpose({
  triggerRef,
});
</script>
