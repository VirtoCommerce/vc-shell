<template>
  <VcPopup
    :title="t('COMPONENTS.CHANGE_PASSWORD.TITLE')"
    is-mobile-fullscreen
    @close="$emit('close')"
  >
    <template #content>
      <!-- <div class="change-password tw-p-3 tw-overflow-scroll"> -->
      <VcForm class="tw-flex tw-flex-col tw-flex-auto">
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          name="current"
          rules="required|min:6"
          :model-value="form.currentPassword"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.currentPassword"
            class="tw-mb-4 tw-mt-1"
            :label="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
            :placeholder="t('COMPONENTS.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          name="new_pass"
          rules="required|min:6"
          :model-value="form.password"
        >
          <VcInput
            v-bind="field"
            ref="newPasswordField"
            v-model="form.password"
            class="tw-mb-4 tw-mt-1"
            :label="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
            :placeholder="t('COMPONENTS.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
          name="confirm_pass"
          rules="required|min:6"
          :model-value="form.confirmPassword"
        >
          <VcInput
            v-bind="field"
            ref="confirmPasswordField"
            v-model="form.confirmPassword"
            class="tw-mb-4"
            :label="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
            :placeholder="t('COMPONENTS.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
      </VcForm>
    </template>
    <template #footer>
      <div class="tw-flex tw-flex-col tw-flex-auto">
        <div class="tw-flex tw-justify-between tw-flex-auto">
          <!-- <span
          v-if="$isDesktop.value"
          class="tw-grow tw-basis-0"
        ></span> -->
          <VcButton
            :outline="true"
            class="tw-mr-3"
            @click="$emit('close')"
          >
            {{ t("COMPONENTS.CHANGE_PASSWORD.CANCEL") }}
          </VcButton>
          <VcButton
            :disabled="loading || !form.isValid || isDisabled"
            @click="changePassword"
          >
            {{ t("COMPONENTS.CHANGE_PASSWORD.SAVE") }}
          </VcButton>
        </div>
        <VcHint
          v-for="(err, i) in form.errors"
          :key="i"
          class="tw-mt-3 !tw-text-[#f14e4e]"
        >
          <!-- TODO: stylizing-->
          {{
            (err as IIdentityError).code ? t(`COMPONENTS.CHANGE_PASSWORD.ERRORS.${(err as IIdentityError).code}`) : err
          }}
        </VcHint>
      </div>
    </template>

    <!-- </div> -->
  </VcPopup>
</template>

<script lang="ts" setup>
import { nextTick, reactive, computed } from "vue";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { VcInput, VcHint, VcButton, VcPopup, VcForm } from "./../../../ui/components";
import { IIdentityError } from "./../../../core/api/platform";
import { useUser } from "./../../../core/composables/useUser";
import { useI18n } from "vue-i18n";

interface IChangePassForm {
  isValid: boolean;
  errors: IIdentityError[] | string[];
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

interface Emits {
  (event: "close"): void;
}

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const { changeUserPassword, loading, validatePassword } = useUser();
useForm({ validateOnMount: false });
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const form = reactive<IChangePassForm>({
  isValid: false,
  errors: [],
  currentPassword: "",
  password: "",
  confirmPassword: "",
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
});

async function changePassword() {
  const result = await changeUserPassword(form.currentPassword, form.password);
  if (result?.succeeded) {
    emit("close");
  } else if (result?.errors) {
    form.errors = result?.errors;
    form.isValid = form.errors.length == 0;
  }
}

function validate() {
  nextTick(async () => {
    if (form.password || form.confirmPassword) {
      form.errors = (await validatePassword(form.password)).errors ?? [];
      if (form.confirmPassword !== form.password) {
        (form.errors as IIdentityError[]).push({ code: "Repeat-password" });
      }
      if (form.confirmPassword === form.currentPassword && form.password === form.currentPassword) {
        (form.errors as IIdentityError[]).push({ code: "Equal-passwords" });
      }
      form.isValid = form.errors.length == 0;
    }
  });
}
</script>

<style lang="scss">
:root {
  --change-password-scroll-color: #e1eff9;
  --change-password-scroll-color-hover: #cce4f5;
  --change-password-scroll-width: 8px;
  --change-password-scroll-padding: 8px;
  --change-password-scroll-shadow: 0 3px 2px rgba(0, 0, 0, 0.1) inset, 0 -3px 2px rgba(0, 0, 0, 0.1) inset;
}

.change-password {
  &::-webkit-scrollbar {
    @apply tw-w-[var(--change-password-scroll-width)] tw-bg-transparent;
  }

  &::-webkit-scrollbar-track {
    @apply tw-bg-transparent;
  }

  &::-webkit-scrollbar-thumb {
    @apply tw-bg-[color:var(--change-password-scroll-color)]
      tw-rounded-[calc(var(--change-password-scroll-width)/2)]
      tw-overflow-x-hidden
      hover:tw-bg-[color:var(--change-password-scroll-color-hover)];
  }
}
</style>
