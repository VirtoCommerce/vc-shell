<template>
  <VcPopup
    variant="small"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @close="$emit('close')"
  >
    <div class="p-3">
      <VcForm>
        <VcInput
          ref="passwordField"
          class="mb-4 mt-1"
          :label="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')
          "
          type="password"
          :required="true"
          rules="min:6"
          name="current"
          v-model="form.currentPassword"
        ></VcInput>
        <VcInput
          ref="newPasswordField"
          class="mb-4 mt-1"
          :label="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          :placeholder="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
          type="password"
          @update:modelValue="validate"
          :required="true"
          rules="min:6"
          name="new_pass"
          v-model="form.password"
        ></VcInput>
        <VcInput
          ref="confirmPasswordField"
          class="mb-4"
          :label="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')
          "
          :required="true"
          rules="min:6"
          @update:modelValue="validate"
          type="password"
          name="confirm_pass"
          v-model="form.confirmPassword"
        ></VcInput>
        <div class="flex justify-center items-center pt-2">
          <span v-if="$isDesktop.value" class="grow basis-0"></span>
          <VcButton
            variant="primary"
            :outline="true"
            class="mr-3"
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
          class="mt-3 text-[#f14e4e]"
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
import { useUser } from "@virtoshell/core";
import { IIdentityError } from "@virtoshell/api-client";
import { useIsFormValid } from "vee-validate";
import { useForm } from "@virtoshell/ui";

interface IChangePassForm {
  isValid: boolean;
  errors: IIdentityError[] | string[];
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const emit = defineEmits(["close"]);
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
