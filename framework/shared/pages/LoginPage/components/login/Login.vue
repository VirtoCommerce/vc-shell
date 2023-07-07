<template>
  <VcLoginForm
    :logo="customization.logo"
    :background="background"
    :title="title"
  >
    <template v-if="isLogin">
      <VcForm @submit.prevent="login">
        <Field
          v-slot="{ field, errorMessage, handleChange, errors }"
          :label="t('LOGIN.FIELDS.LOGIN.LABEL')"
          name="username"
          :model-value="form.username"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="loginField"
            v-model="form.username"
            class="tw-mb-4 tw-mt-1"
            :label="t('LOGIN.FIELDS.LOGIN.LABEL')"
            :placeholder="t('LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>
        <Field
          v-slot="{ field, errorMessage, handleChange, errors }"
          :label="t('LOGIN.FIELDS.PASSWORD.LABEL')"
          name="password"
          :model-value="form.password"
          rules="required"
        >
          <VcInput
            v-bind="field"
            ref="passwordField"
            v-model="form.password"
            class="tw-mb-4"
            :label="t('LOGIN.FIELDS.PASSWORD.LABEL')"
            :placeholder="t('LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @keyup.enter="login"
            @update:model-value="handleChange"
          />
        </Field>

        <div
          v-if="forgotPassword"
          class="tw-flex tw-justify-end tw-items-center tw-pt-2"
        >
          <VcButton
            text
            type="button"
            @click="togglePassRequest"
          >
            {{ t("LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </VcButton>
        </div>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <vc-button
            :disabled="loading || !isValid"
            class="tw-w-28"
            @click="login"
          >
            {{ t("LOGIN.BUTTON") }}
          </vc-button>
        </div>
      </VcForm>
      <div
        v-if="loginProviders && loginProviders.length"
        class="tw-mt-4"
      >
        <div
          class="tw-flex tw-items-center tw-text-center tw-uppercase tw-text-[color:var(--separator-text)] before:tw-content-[''] before:tw-flex-1 before:tw-border-b before:tw-border-b-[color:var(--separator)] before:tw-mr-2 after:tw-content-[''] after:tw-flex-1 after:tw-border-b after:tw-border-b-[color:var(--separator)] after:tw-ml-2"
        >
          OR
        </div>
        <div class="tw-flex tw-justify-center tw-mt-4 tw-flex-wrap tw-gap-2">
          <VcButton
            v-for="external in loginProviders"
            :key="external.authenticationType"
            outline
            @click="externalSignOn(external.authenticationType)"
            ><div class="tw-flex tw-flex-row tw-items-center">
              <img
                :src="externalAuthIcon(external.authenticationType)"
                :alt="external.authenticationType"
                class="tw-h-5 tw-mr-2"
              />{{ external.displayName }}
            </div></VcButton
          >
        </div>
      </div>
    </template>
    <template v-else>
      <template v-if="!forgotPasswordRequestSent">
        <VcForm @submit.prevent="forgot">
          <Field
            v-slot="{ field, errorMessage, handleChange, errors }"
            :label="t('LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
            name="loginOrEmail"
            :model-value="forgotPasswordForm.loginOrEmail"
            rules="required|email"
          >
            <VcInput
              v-bind="field"
              ref="forgotPasswordField"
              v-model="forgotPasswordForm.loginOrEmail"
              class="tw-mb-4 tw-mt-1"
              :label="t('LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
              :placeholder="t('LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
              :hint="t('LOGIN.RESET_EMAIL_TEXT')"
              required
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            ></VcInput>
          </Field>
          <div class="tw-flex tw-justify-between tw-items-center tw-pt-2">
            <vc-button
              text
              type="button"
              @click="togglePassRequest"
            >
              {{ t("LOGIN.BACK_BUTTON") }}
            </vc-button>
            <vc-button
              :disabled="loading || isDisabled || loadingForgotPassword"
              @click="forgot"
            >
              {{ t("LOGIN.FORGOT_BUTTON") }}
            </vc-button>
          </div>
        </VcForm>
      </template>

      <template v-if="requestPassResult.succeeded && forgotPasswordRequestSent">
        <div>{{ t("LOGIN.RESET_EMAIL_SENT") }}</div>
        <div class="tw-flex tw-justify-center tw-items-center tw-pt-2">
          <span
            v-if="$isDesktop.value"
            class="tw-grow tw-basis-0"
          ></span>
          <vc-button
            :disabled="loading"
            @click="togglePassRequest"
          >
            {{ t("LOGIN.BUTTON_OK") }}
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
import { ref, reactive, computed, onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useSettings, useUser } from "./../../../../../core/composables";
import { RequestPasswordResult, SignInResults } from "./../../../../../core/types";
import { CommonPageComposables } from "./../../../../../typings";
import AzureAdIcon from "./../../../../../assets/img/AzureAd.svg";
import { ExternalSignInProviderInfo } from "./../../../../../core/api/platform";
import { useI18n } from "vue-i18n";

export interface Props {
  logo: string;
  background: string;
  title: string;
}

const props = defineProps<Props>();

const router = useRouter();

useForm({ validateOnMount: false });
const { getUiCustomizationSettings, uiSettings } = useSettings();
const { t } = useI18n({ useScope: "global" });
let useLogin;
const injected = inject<CommonPageComposables>("commonPageComposables");
const signInResult = ref<SignInResults>({ succeeded: true });
const requestPassResult = ref<RequestPasswordResult>({ succeeded: true });
const forgotPasswordRequestSent = ref(false);
const { signIn, loading, externalSignIn, getExternalLoginProviders } = useUser();
const isLogin = ref(true);
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();
const customizationLoading = ref(false);
const loadingForgotPassword = ref(false);
const loginProviders = ref<ExternalSignInProviderInfo[]>();
let forgotPassword;

if (injected) {
  useLogin = injected?.useLogin;

  if (useLogin) {
    const { forgotPassword: forgot } = useLogin();
    forgotPassword = forgot;
  }
}

onMounted(async () => {
  try {
    customizationLoading.value = true;
    loginProviders.value = await getExternalLoginProviders();
    await getUiCustomizationSettings();
  } finally {
    customizationLoading.value = false;
  }
});

const externalAuthIcon = (authenticationType: string) => {
  if (authenticationType === "AzureAD") return AzureAdIcon;
  else return;
};

const customization = computed(() => {
  return (
    !customizationLoading.value && {
      logo: uiSettings.value?.logo || props.logo,
    }
  );
});

const isDisabled = computed(() => {
  return !isDirty.value || !isValid.value;
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
  if (isValid.value && forgotPassword) {
    try {
      loadingForgotPassword.value = true;
      await forgotPassword({ loginOrEmail: forgotPasswordForm.loginOrEmail });
      forgotPasswordRequestSent.value = true;
    } finally {
      loadingForgotPassword.value = false;
    }
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

const externalSignOn = async (authenticationType: string) => {
  await externalSignIn(authenticationType, window.location.pathname);
};

console.debug("Init login-page");
</script>

<style lang="scss">
:root {
  --separator: #d3dbe9;
  --separator-text: #83a3be;
}
</style>
