<template>
  <VcLoginForm :logo="logo" :background="background" :title="computedTitle">
    <VcForm>
      <template v-if="isLogin">
        <VcInput
          ref="loginField"
          class="mb-4 mt-1"
          :label="$t('SHELL.LOGIN.FIELDS.LOGIN.LABEL')"
          :placeholder="$t('SHELL.LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
          :required="true"
          rules="required"
          v-model="form.username"
        ></VcInput>
        <VcInput
          ref="passwordField"
          class="mb-4"
          :label="$t('SHELL.LOGIN.FIELDS.PASSWORD.LABEL')"
          :placeholder="$t('SHELL.LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
          :required="true"
          rules="required"
          v-model="form.password"
          type="password"
          @keyup.enter="login"
        ></VcInput>
        <div class="flex justify-end items-center pt-2 pb-3">
          <VcButton variant="onlytext" @click="togglePassRequest">
            {{ $t("SHELL.LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </VcButton>
        </div>
        <div class="flex justify-center items-center pt-2">
          <span v-if="$isDesktop.value" class="grow basis-0"></span>
          <vc-button
            variant="primary"
            :disabled="loading || !form.username || !form.password"
            @click="login"
          >
            {{ $t("SHELL.LOGIN.BUTTON") }}
          </vc-button>
        </div>
      </template>
      <template v-else>
        <template v-if="!forgotPasswordRequestSent">
          <VcInput
            ref="forgotPasswordField"
            class="mb-4 mt-1"
            :label="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
            :placeholder="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
            :required="true"
            rules="required"
            v-model="forgotPasswordForm.loginOrEmail"
            :fieldDescription="$t('SHELL.LOGIN.RESET_EMAIL_TEXT')"
          ></VcInput>
          <div class="flex justify-between items-center pt-2">
            <vc-button variant="secondary" @click="togglePassRequest">
              {{ $t("SHELL.LOGIN.BACK_BUTTON") }}
            </vc-button>
            <vc-button
              variant="primary"
              :disabled="loading || !forgotPasswordForm.loginOrEmail"
              @click="forgot"
            >
              {{ $t("SHELL.LOGIN.FORGOT_BUTTON") }}
            </vc-button>
          </div>
        </template>

        <template
          v-if="requestPassResult.succeeded && forgotPasswordRequestSent"
        >
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

      <VcHint
        v-if="!signInResult.succeeded"
        class="mt-3"
        style="color: #f14e4e"
      >
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
    </VcForm>
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
} from "@virtoshell/core";

import { useLogin } from "../modules/login";
import { useForm } from "@virtoshell/ui";
import { useRouter } from "vue-router";

const props = defineProps({
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
const { t } = useI18n();
const router = useRouter();
const { validate } = useForm({ validateOnMount: false });
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

const computedTitle = computed(() =>
  isLogin.value ? props.title : t("SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.TITLE")
);

const login = async () => {
  const { valid } = await validate();
  if (valid) {
    signInResult.value = await signIn(form.username, form.password);
    router.push("/");
  }
};

const forgot = async () => {
  const { valid } = await validate();
  if (valid) {
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
