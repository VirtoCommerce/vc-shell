<template>
  <div
    class="vc-multivalue"
    :class="[
      `vc-multivalue_${type}`,
      {
        'vc-multivalue_error': errorMessage,
        'vc-multivalue_disabled': disabled,
      },
    ]"
  >
    <!-- Input label -->
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </vc-label>

    <!-- Input field -->
    <div class="vc-multivalue__field-wrapper vc-flex">
      <div
        v-for="(item, i) in modelValue"
        :key="item.id"
        class="vc-multivalue__field-value-wrapper"
      >
        <div class="vc-multivalue__field-value">
          <span
            class="vc-multivalue__field-value-content vc-ellipsis"
            :title="
              type === 'number' ? Number(item.value).toFixed(3) : item.value
            "
            >{{
              type === "number" ? Number(item.value).toFixed(3) : item.value
            }}</span
          >
          <vc-icon
            v-if="!disabled"
            class="vc-multivalue__field-value-clear"
            icon="fas fa-times"
            size="s"
            @click="onDelete(i)"
          ></vc-icon>
        </div>
      </div>

      <input
        class="vc-multivalue__field vc-flex-grow_1 vc-padding-left_m"
        :placeholder="placeholder"
        :type="type"
        :value="value"
        :disabled="disabled"
        @keypress.enter="onInput"
      />
    </div>

    <slot v-if="errorMessage" name="error">
      <vc-hint class="vc-multivalue__error vc-margin-top_xs">
        {{ errorMessage }}
      </vc-hint>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, unref, getCurrentInstance } from "vue";
import { useField } from "vee-validate";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import { IValidationRules } from "../../../typings";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcInput",

  components: {
    VcLabel,
    VcIcon,
  },

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: Array,
      default: () => [],
    },

    required: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: "text",
    },

    label: {
      type: String,
      default: undefined,
    },

    tooltip: {
      type: String,
      default: undefined,
    },

    name: {
      type: String,
      default: "Field",
    },

    rules: {
      type: [String, Object],
    },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const instance = getCurrentInstance();

    // Prepare validation rules using required and rules props combination
    let internalRules = unref(props.rules) || "";
    if (props.required) {
      if (typeof internalRules === "string") {
        (internalRules as string) = `required|${internalRules}`.replace(
          /(\|)+$/,
          ""
        );
      } else {
        (internalRules as IValidationRules).required = true;
      }
    }

    // Prepare field-level validation
    const { errorMessage, handleChange, value } = useField(
      `${instance?.uid || props.name}`,
      internalRules
    );

    return {
      value,
      errorMessage,

      // Handle input event to propertly validate value and emit changes
      onInput(e: InputEvent) {
        const newValue = (e.target as HTMLInputElement).value;
        emit("update:modelValue", [...props.modelValue, { value: newValue }]);
        handleChange("");
      },

      // Handle event to propertly remove particular value and emit changes
      onDelete(i: number) {
        const result = unref(props.modelValue);
        result.splice(i, 1);
        emit("update:modelValue", [...result]);
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --multivalue-height: 38px;
  --multivalue-border-radius: 3px;
  --multivalue-border-color: #d3dbe9;
  --multivalue-border-color-error: #f14e4e;
  --multivalue-background-color: #ffffff;
  --multivalue-placeholder-color: #a5a5a5;
}

.vc-multivalue {
  overflow: hidden;

  &_date,
  &_datetime-local {
    max-width: 220px;

    .vc-app_mobile & {
      max-width: 100%;
    }
  }

  &__field-wrapper {
    border: 1px solid var(--multivalue-border-color);
    border-radius: var(--multivalue-border-radius);
    background-color: var(--multivalue-background-color);
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }

  &_error &__field-wrapper {
    border: 1px solid var(--multivalue-border-color-error);
  }

  &__error {
    color: var(--multivalue-border-color-error);
  }

  &__field {
    border: none;
    outline: none;
    height: var(--multivalue-height);
    min-width: 0;
    box-sizing: border-box;
    min-width: 120px;

    &::-webkit-input-placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &::-moz-placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &::-ms-placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &::placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &-value-wrapper {
      height: var(--multivalue-height);
      margin-left: var(--margin-s);
      display: flex;
      align-items: center;
    }

    &-value {
      background: #fbfdfe;
      border: 1px solid #bdd1df;
      border-radius: 2px;
      display: flex;
      align-items: center;
      height: 26px;
      box-sizing: border-box;
      padding: 0 var(--padding-s);
      max-width: 150px;

      &-clear {
        color: #a9bfd2;
        margin-left: var(--margin-s);
        cursor: pointer;
      }
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    background-color: #fafafa;
    color: #424242;
  }
}
</style>
