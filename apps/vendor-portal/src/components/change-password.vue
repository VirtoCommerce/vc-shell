<template>
  <VcPopup
    variant="small"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @close="$emit('close')"
  >
    <div class="vc-padding_m">
      <VcForm>
        <VcInput
          ref="passwordField"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')
          "
          type="password"
          :required="true"
          v-model="form.currentPassword"
        ></VcInput>
        <VcInput
          ref="newPasswordField"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          :placeholder="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
          type="password"
          @update:modelValue="validate"
          :required="true"
          v-model="form.password"
        ></VcInput>
        <VcInput
          ref="confirmPasswordField"
          class="vc-margin-bottom_l"
          :label="$t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.CHANGE_PASSWORD.CONFIRM_PASSWORD.PLACEHOLDER')
          "
          :required="true"
          @update:modelValue="validate"
          type="password"
          v-model="form.confirmPassword"
        ></VcInput>
        <div
          class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding-top_s"
        >
          <span v-if="$isDesktop.value" class="vc-flex-grow_1"></span>
          <VcButton
            variant="primary"
            :outline="true"
            class="vc-margin-right_m"
            @click="$emit('close')"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.CANCEL") }}
          </VcButton>
          <VcButton
            variant="primary"
            :disabled="loading || !form.isValid"
            @click="changePassword"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.SAVE") }}
          </VcButton>
        </div>

        <VcHint
          class="vc-margin-top_m"
          style="color: #f14e4e"
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
import { reactive } from "vue";
import { useUser } from "@virtoshell/core";
import { IIdentityError } from "@virtoshell/api-client";

interface IChangePassForm {
  isValid: boolean;
  errors: IIdentityError[] | string[];
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const emit = defineEmits(["close"]);
const { changeUserPassword, loading, validatePassword } = useUser();
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
  }
}

async function validate() {
  form.errors = (await validatePassword(form.password)).errors;
  if (form.confirmPassword !== form.password) {
    form.errors.push({ code: "Repeat-password" });
  }
  form.isValid = form.errors.length == 0;
}
</script>

<style lang="less" scoped></style>
