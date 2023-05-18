<template>
  <VcPopup
    variant="small"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @close="$emit('close')"
  >
    <div class="tw-p-3">
      <VcForm>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          name="current"
          rules="required|min:6"
          :model-value="form.currentPassword"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.currentPassword"
            class="tw-mb-4 tw-mt-1"
            :label="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
            :placeholder="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          name="new_pass"
          rules="required|min:6"
          :model-value="form.password"
        >
          <VcInput
            v-bind="field"
            ref="newPasswordField"
            v-model="form.password"
            class="tw-mb-4 tw-mt-1"
            :label="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
            :placeholder="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <Field
          v-slot="{ field, errorMessage, errors }"
          :label="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
          name="confirm_pass"
          rules="required|min:6"
          :model-value="form.confirmPassword"
        >
          <VcInput
            v-bind="field"
            ref="confirmPasswordField"
            v-model="form.confirmPassword"
            class="tw-mb-4"
            :label="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
            :placeholder="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="validate"
          ></VcInput>
        </Field>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
          <VcButton
            variant="primary"
            :outline="true"
            class="tw-mr-3"
            @click="$emit('close')"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.CANCEL") }}
          </VcButton>
          <VcButton
            variant="primary"
            :disabled="loading || !form.isValid || isDisabled"
            @click="changePassword"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.SAVE") }}
          </VcButton>
        </div>

        <VcHint
          v-for="(err, i) in form.errors"
          :key="i"
          class="tw-mt-3 !tw-text-[#f14e4e]"
        >
          <!-- TODO: stylizing-->
          {{ (err as IIdentityError).code ? $t(`SHELL.CHANGE_PASSWORD.ERRORS.${(err as IIdentityError).code}`) : err }}
        </VcHint>
      </VcForm>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
import { nextTick, reactive, computed } from "vue";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { VcInput, VcHint, VcButton, VcPopup, VcForm, IIdentityError, useUser } from "@vc-shell/framework";

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
  if (result.succeeded) {
    emit("close");
  } else {
    form.errors = result.errors;
    form.isValid = form.errors.length == 0;
  }
}

function validate() {
  nextTick(async () => {
    if (form.password || form.confirmPassword) {
      form.errors = (await validatePassword(form.password)).errors;
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
