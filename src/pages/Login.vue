<template>
  <VcLoginForm :logo="logo" :background="background" :title="computedTitle">
    <template v-if="isLogin">
      <VcForm @submit.prevent="login">
        <VcInput
          ref="loginField"
          class="mb-4 mt-1"
          :label="$t('SHELL.LOGIN.FIELDS.LOGIN.LABEL')"
          :placeholder="$t('SHELL.LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
          :required="true"
          v-model="form.username"
        ></VcInput>
        <VcInput
          ref="passwordField"
          class="mb-4"
          :label="$t('SHELL.LOGIN.FIELDS.PASSWORD.LABEL')"
          :placeholder="$t('SHELL.LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
          :required="true"
          v-model="form.password"
          type="password"
          @keyup.enter="login"
        ></VcInput>
        <div class="flex justify-end items-center pt-2 pb-3">
          <VcButton variant="onlytext" @click="togglePassRequest" type="button">
            {{ $t("SHELL.LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </VcButton>
        </div>
        <div class="flex justify-center items-center pt-2">
          <span v-if="$isDesktop.value" class="grow basis-0"></span>
          <vc-button
            variant="primary"
            :disabled="loading || !isValid"
            @click="login"
          >
            {{ $t("SHELL.LOGIN.BUTTON") }}
          </vc-button>
        </div>
      </VcForm>
    </template>
    <template v-else>
      <template v-if="!forgotPasswordRequestSent">
        <VcForm @submit.prevent="forgot">
          <VcInput
            ref="forgotPasswordField"
            class="mb-4 mt-1"
            :label="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
            :placeholder="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
            :required="true"
            v-model="forgotPasswordForm.loginOrEmail"
            :fieldDescription="$t('SHELL.LOGIN.RESET_EMAIL_TEXT')"
          ></VcInput>
          <div class="flex justify-between items-center pt-2">
            <vc-button
              variant="secondary"
              type="button"
              @click="togglePassRequest"
            >
              {{ $t("SHELL.LOGIN.BACK_BUTTON") }}
            </vc-button>
            <vc-button
              variant="primary"
              :disabled="loading || !isValid"
              @click="forgot"
            >
              {{ $t("SHELL.LOGIN.FORGOT_BUTTON") }}
            </vc-button>
          </div>
        </VcForm>
      </template>

      <template v-if="requestPassResult.succeeded && forgotPasswordRequestSent">
        <div>{{ $t("SHELL.LOGIN.RESET_EMAIL_SENT") }}</div>
        <div class="flex justify-center items-center pt-2">
          <span v-if="$isDesktop.value" class="grow basis-0"></span>
          <vc-button
            variant="primary"
            :disabled="loading"
            @click="togglePassRequest"
          >
            {{ $t("SHELL.LOGIN.BUTTON_OK") }}
          </vc-button>
        </div>
      </template>
    </template>

    <VcHint v-if="!signInResult.succeeded" class="mt-3" style="color: #f14e4e">
      <!-- TODO: stylizing-->
      {{ signInResult.error }}
    </VcHint>
    <VcHint
      v-if="!requestPassResult.succeeded"
      class="mt-3"
      style="color: #f14e4e"
    >
      <!-- TODO: stylizing-->
      {{ requestPassResult.error }}
    </VcHint>
  </VcLoginForm>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from "vue";
import {
  useLogger,
  useUser,
  SignInResult,
  RequestPasswordResult,
  useI18n,
} from "@vc-shell/core";

import { useLogin } from "../modules/login";
import { useForm } from "@vc-shell/ui";
import {useRoute, useRouter} from "vue-router";
import { useIsFormValid } from "vee-validate";

// const props = defineProps({
//   logo: {
//     type: String,
//     default: undefined,
//   },
//
//   background: {
//     type: String,
//     default: undefined,
//   },
//
//   title: {
//     type: String,
//     default: undefined,
//   },
// });
const log = useLogger();
const { t } = useI18n();
const router = useRouter();
const route=  useRoute()
useForm({ validateOnMount: false });
const {logo, background, title} = route.meta

const signInResult = ref<SignInResult>({ succeeded: true });
const requestPassResult = ref<RequestPasswordResult>({ succeeded: true });
const forgotPasswordRequestSent = ref(false);
const { signIn, loading } = useUser();
const { forgotPassword } = useLogin();
const isLogin = ref(true);
const isValid = useIsFormValid();
const form = reactive({
  username: "",
  password: "",
});
const forgotPasswordForm = reactive({
  loginOrEmail: "",
});

const computedTitle = computed(() =>
  isLogin.value ? title : t("SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.TITLE")
);

const login = async () => {
  if (isValid.value) {
    signInResult.value = await signIn(form.username, form.password);
    router.push("/");
  }
};

const forgot = async () => {
  if (isValid.value) {
    await forgotPassword({ loginOrEmail: forgotPasswordForm.loginOrEmail });
    forgotPasswordRequestSent.value = true;
  }
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
