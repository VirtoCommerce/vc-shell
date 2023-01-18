<template>
  <VcPopup
    variant="small"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @close="$emit('close')"
  >
    <div class="tw-p-3">
      <VcForm>
          <Field name="current" rules="required|min:6" :modelValue="form.currentPassword" v-slot="{field, errorMessage, errors}">
              <VcInput
                    v-bind="field"
                    ref="passwordField"
                    class="tw-mb-4 tw-mt-1"
                    :label="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
                    :placeholder="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')"
                    type="password"
                    v-model="form.currentPassword"
                    @update:modelValue="validate"
                    required
                    :error="!!errors.length"
                    :error-message="errorMessage"
              ></VcInput>
          </Field>
          <Field name="new_pass" rules="required|min:6" :modelValue="form.password" v-slot="{field, errorMessage, errors}">
              <VcInput
                      v-bind="field"
                      ref="newPasswordField"
                      class="tw-mb-4 tw-mt-1"
                      :label="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
                      :placeholder="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
                      type="password"
                      @update:modelValue="validate"
                      v-model="form.password"
                      required
                      :error="!!errors.length"
                      :error-message="errorMessage"
              ></VcInput>
          </Field>
          <Field name="confirm_pass" rules="required|min:6" :modelValue="form.confirmPassword" v-slot="{field, errorMessage, errors}">
              <VcInput
                      v-bind="field"
                      ref="confirmPasswordField"
                      class="tw-mb-4"
                      :label="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
                      :placeholder="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')"
                      @update:modelValue="validate"
                      type="password"
                      v-model="form.confirmPassword"
                      required
                      :error="!!errors.length"
                      :error-message="errorMessage"
              ></VcInput>
          </Field>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span v-if="$isDesktop.value" class="tw-grow tw-basis-0"></span>
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
            :disabled="loading || !form.isValid || !isValid"
            @click="changePassword"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.SAVE") }}
          </VcButton>
        </div>

        <VcHint
          class="tw-mt-3 !tw-text-[#f14e4e]"
          v-for="error in form.errors"
          :key="error"
        >
          <!-- TODO: stylizing-->
          {{
            error.code
              ? $t(`SHELL.CHANGE_PASSWORD.ERRORS.${error.code}`)
              : error
          }}
        </VcHint>
      </VcForm>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
import { nextTick, reactive } from "vue";
import { useIsFormValid, Field } from "vee-validate";
import {
  useForm,
  VcInput,
  VcHint,
  VcButton,
  VcPopup,
  VcForm,
  IIdentityError,
  useUser,
} from "@vc-shell/framework";

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
const form = reactive<IChangePassForm>({
  isValid: false,
  errors: [],
  currentPassword: "",
  password: "",
  confirmPassword: "",
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
        form.errors.push({ code: "Repeat-password" });
      }
      if (
        form.confirmPassword === form.currentPassword &&
        form.password === form.currentPassword
      ) {
        form.errors.push({ code: "Equal-passwords" });
      }
      form.isValid = form.errors.length == 0;
    }
  });
}
</script>
