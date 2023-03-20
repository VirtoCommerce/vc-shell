<template>
  <VcLoginForm
    :logo="customization.logo"
    :background="background"
    :title="title"
  >
    <template v-if="isLogin">
      <VcForm @submit.prevent="login">
        <Field
          :label="$t('SHELL.LOGIN.FIELDS.LOGIN.LABEL')"
          name="username"
          v-slot="{ field, errorMessage, handleChange, errors }"
          :modelValue="form.username"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="loginField"
            class="tw-mb-4 tw-mt-1"
            :label="$t('SHELL.LOGIN.FIELDS.LOGIN.LABEL')"
            :placeholder="$t('SHELL.LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
            v-model="form.username"
            @update:modelValue="handleChange"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
          />
        </Field>
        <Field
          :label="$t('SHELL.LOGIN.FIELDS.PASSWORD.LABEL')"
          name="password"
          v-slot="{ field, errorMessage, handleChange, errors }"
          :modelValue="form.password"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            class="tw-mb-4"
            :label="$t('SHELL.LOGIN.FIELDS.PASSWORD.LABEL')"
            :placeholder="$t('SHELL.LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
            v-model="form.password"
            type="password"
            @keyup.enter="login"
            @update:modelValue="handleChange"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
          />
        </Field>

        <div class="tw-flex tw-justify-end tw-items-center tw-pt-2 tw-pb-3">
          <VcButton
            variant="onlytext"
            @click="togglePassRequest"
            type="button"
          >
            {{ $t("SHELL.LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </VcButton>
        </div>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
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
          <Field
            :label="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
            name="loginOrEmail"
            v-slot="{ field, errorMessage, handleChange, errors }"
            :modelValue="forgotPasswordForm.loginOrEmail"
            rules="required"
          >
            <VcInput
              v-bind="field"
              ref="forgotPasswordField"
              class="tw-mb-4 tw-mt-1"
              :label="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
              :placeholder="$t('SHELL.LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
              v-model="forgotPasswordForm.loginOrEmail"
              :hint="$t('SHELL.LOGIN.RESET_EMAIL_TEXT')"
              required
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:modelValue="handleChange"
            ></VcInput>
          </Field>
          <div class="tw-flex tw-justify-between tw-items-center tw-pt-2">
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
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
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
      class="tw-mt-3"
      style="color: #f14e4e"
    >
      <!-- TODO: stylizing-->
      {{ signInResult.error }}
    </VcHint>
    <VcHint
      v-if="!requestPassResult.succeeded"
      class="tw-mt-3"
      style="color: #f14e4e"
    >
      <!-- TODO: stylizing-->
      {{ requestPassResult.error }}
    </VcHint>
  </VcLoginForm>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useUser, useForm, SignInResults, RequestPasswordResult, useSettings } from "@vc-shell/framework";
import { useLogin } from "../modules/login";
import { useRouter, useRoute } from "vue-router";
import { useIsFormValid, Field } from "vee-validate";

const router = useRouter();
const route = useRoute();
useForm({ validateOnMount: false });
const { logo, background, title } = route.meta as { logo: string; background: string; title: string };
const { getUiCustomizationSettings, uiSettings } = useSettings();

const signInResult = ref<SignInResults>({ succeeded: true });
const requestPassResult = ref<RequestPasswordResult>({ succeeded: true });
const forgotPasswordRequestSent = ref(false);
const { signIn, loading } = useUser();
const { forgotPassword } = useLogin();
const isLogin = ref(true);
const isValid = useIsFormValid();
const customizationLoading = ref(false);

onMounted(async () => {
  try {
    customizationLoading.value = true;
    await getUiCustomizationSettings();
  } finally {
    customizationLoading.value = false;
  }
});

const customization = computed(() => {
  return (
    !customizationLoading.value && {
      logo: uiSettings.value?.logo || logo,
    }
  );
});

const form = reactive({
  username: "",
  password: "",
});

const forgotPasswordForm = reactive({
  loginOrEmail: "",
});

const login = async () => {
  if (isValid.value) {
    signInResult.value = await signIn(form.username, form.password);

    if (signInResult.value.succeeded) {
      router.push("/");
    }
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

console.debug("Init login-page");
</script>
