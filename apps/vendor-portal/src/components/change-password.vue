<template>
  <vc-popup
    variant="small"
    :title="$t('SHELL.ACCOUNT.CHANGE_PASSWORD')"
    @close="$emit('close')"
  >
    <div class="vc-padding_m">
      <vc-form>
        <vc-input
          ref="passwordField"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.CHANGE_PASSWORD.CURRENT_PASSWORD.PLACEHOLDER')
          "
          type="password"
          :required="true"
          v-model="form.currentPassword"
        ></vc-input>
        <vc-input
          ref="newPasswordField"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.LABEL')"
          :placeholder="$t('SHELL.CHANGE_PASSWORD.NEW_PASSWORD.PLACEHOLDER')"
          type="password"
          @update:modelValue="validate"
          :required="true"
          v-model="form.password"
        ></vc-input>
        <vc-input
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
        ></vc-input>
        <div
          class="
            vc-flex
            vc-flex-justify_center
            vc-flex-align_center
            vc-padding-top_s
          "
        >
          <span v-if="$isDesktop.value" class="vc-flex-grow_1"></span>
          <vc-button
            variant="primary"
            :outline="true"
            class="vc-margin-right_m"
            @click="$emit('close')"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.CANCEL") }}
          </vc-button>
          <vc-button
            variant="primary"
            :disabled="loading || !form.isValid"
            @click="changePassword"
          >
            {{ $t("SHELL.CHANGE_PASSWORD.SAVE") }}
          </vc-button>
        </div>

        <vc-hint
          class="vc-margin-top_m"
          style="color: #f14e4e"
          v-for="error in form.errors"
          :key="error"
        >
          <!-- TODO: stylizing-->
          {{ $t(`SHELL.CHANGE_PASSWORD.ERRORS.${error}`) }}
        </vc-hint>
      </vc-form>
    </div>
  </vc-popup>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useUser } from "@virtoshell/core";

export default defineComponent({
  name: "ChangePassword",
  setup(props, { emit }) {
    const { changeUserPassword, loading, validatePassword } = useUser();
    const form = reactive({
      isValid: false,
      errors: [],
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });

    async function changePassword() {
      const result = await changeUserPassword(
        form.currentPassword,
        form.password
      );
      if (result.succeeded) {
        emit("close");
      } else {
        form.errors = result.errors;
      }
    }

    async function validate() {
      const errors = (await validatePassword(form.password)).errors;
      form.errors = errors.map((x) => x.code);
      if (form.confirmPassword !== form.password) {
        form.errors.push("Repeat-password");
      }
      form.isValid = form.errors.length == 0;
    }

    return {
      loading,
      form,
      changePassword,
      validate,
    };
  },
});
</script>

<style lang="less" scoped></style>
