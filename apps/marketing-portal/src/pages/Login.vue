<template>
  <VcLoginForm :logo="logo" :background="background" :title="title">
    <VcForm>
      <template v-if="isLogin">
        <VcInput
          ref="loginField"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.LOGIN.FIELDS.LOGIN.LABEL')"
          :placeholder="$t('SHELL.LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
          :required="true"
          v-model="form.username"
        ></VcInput>
        <VcInput
          ref="passwordField"
          class="vc-margin-bottom_l"
          :label="$t('SHELL.LOGIN.FIELDS.PASSWORD.LABEL')"
          :placeholder="$t('SHELL.LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
          :required="true"
          v-model="form.password"
          type="password"
          @keyup.enter="login"
        ></VcInput>
        <div
          class="vc-flex vc-flex-justify_end vc-flex-align_center vc-padding-top_s vc-padding-bottom_m"
        >
          <button
            class="vc-button vc-button_onlytext"
            @click="togglePassRequest"
          >
            {{ $t("SHELL.LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </button>
        </div>
        <div
          class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding-top_s"
        >
          <span v-if="$isDesktop.value" class="vc-flex-grow_1"></span>
          <VcButton variant="primary" :disabled="loading" @click="login">
            {{ $t("SHELL.LOGIN.BUTTON") }}
          </VcButton>
        </div>
      </template>
      <template v-else>
        <template v-if="!forgotPasswordRequestSent">
          <VcInput
            ref="forgotPasswordField"
            class="vc-margin-bottom_l vc-margin-top_xs"
            :label="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
            :placeholder="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
            :required="true"
            v-model="forgotPasswordForm.loginOrEmail"
            fieldDescription="We will send you an email with instructions on how to reset your password."
          ></VcInput>
          <div
            class="vc-flex vc-flex-justify_space-between vc-flex-align_center vc-padding-top_s"
          >
            <VcButton variant="secondary" @click="togglePassRequest">
              {{ $t("SHELL.LOGIN.BACK_BUTTON") }}
            </VcButton>
            <VcButton variant="primary" :disabled="loading" @click="forgot">
              {{ $t("SHELL.LOGIN.FORGOT_BUTTON") }}
            </VcButton>
          </div>
        </template>

        <template
          v-if="requestPassResult.succeeded && forgotPasswordRequestSent"
        >
          <div>Email with instructions has been sent to you.</div>
          <div
            class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding-top_s"
          >
            <span v-if="$isDesktop.value" class="vc-flex-grow_1"></span>
            <VcButton
              variant="primary"
              :disabled="loading"
              @click="togglePassRequest"
            >
              {{ $t("SHELL.LOGIN.BUTTON_OK") }}
            </VcButton>
          </div>
        </template>
      </template>

      <VcHint
        v-if="!signInResult.succeeded"
        class="vc-margin-top_m"
        style="color: #f14e4e"
      >
        <!-- TODO: stylizing-->
        {{ signInResult.error }}
      </VcHint>
      <VcHint
        v-if="!requestPassResult.succeeded"
        class="vc-margin-top_m"
        style="color: #f14e4e"
      >
        <!-- TODO: stylizing-->
        {{ requestPassResult.error }}
      </VcHint>
    </VcForm>
  </VcLoginForm>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import {
  useLogger,
  useUser,
  SignInResult,
  RequestPasswordResult,
} from "@virtoshell/core";

import { useLogin } from "../modules/login";

defineProps({
  logo: {
    type: String,
    default: undefined,
  },

  background: {
    type: String,
    default: undefined,
  },

  title: {
    type: String,
    default: undefined,
  },
});
const log = useLogger();
const signInResult = ref<SignInResult>({ succeeded: true });
const requestPassResult = ref<RequestPasswordResult>({ succeeded: true });
const forgotPasswordRequestSent = ref(false);
const { signIn, loading } = useUser();
const { forgotPassword } = useLogin();
const isLogin = ref(true);
const form = reactive({
  username: "",
  password: "",
});
const forgotPasswordForm = reactive({
  loginOrEmail: "",
});

const login = async () => {
  signInResult.value = await signIn(form.username, form.password);
};

const forgot = async () => {
  await forgotPassword({ loginOrEmail: forgotPasswordForm.loginOrEmail });
  forgotPasswordRequestSent.value = true;
};

const togglePassRequest = () => {
  isLogin.value = !isLogin.value;
  if (isLogin.value) {
    forgotPasswordRequestSent.value = false;
    forgotPasswordForm.loginOrEmail = "";
    requestPassResult.value.error = "";
  }
};

log.debug("Init login-page");
</script>
