<template>
  <VcLoginForm
    :logo="customization.logo"
    :background="background"
    :title="title"
    class="vc-login-page"
  >
    <template v-if="isLogin">
      <VcForm @submit.prevent="login">
        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :label="t('LOGIN.FIELDS.LOGIN.LABEL')"
          name="username"
          :model-value="form.username"
          rules="required"
        >
          <VcInput
            ref="loginField"
            v-model="form.username"
            class="vc-login-page__input"
            :label="t('LOGIN.FIELDS.LOGIN.LABEL')"
            :placeholder="t('LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>
        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :label="t('LOGIN.FIELDS.PASSWORD.LABEL')"
          name="password"
          :model-value="form.password"
          rules="required"
        >
          <VcInput
            ref="passwordField"
            v-model="form.password"
            class="vc-login-page__input--small"
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
          v-if="!!forgotPassword"
          class="vc-login-page__forgot-password-container"
        >
          <VcButton
            text
            type="button"
            @click="togglePassRequest"
          >
            {{ t("LOGIN.FORGOT_PASSWORD_BUTTON") }}
          </VcButton>
        </div>
        <div class="vc-login-page__button-container">
          <vc-button
            :disabled="loading || !isValid"
            class="vc-login-page__submit-button"
            @click="login"
          >
            {{ t("LOGIN.BUTTON") }}
          </vc-button>
        </div>
      </VcForm>
      <div
        v-if="loginProviders && loginProviders.length"
        class="vc-login-page__separator"
      >
        <div class="vc-login-page__separator-line">
          <!-- TODO add to localization -->
          OR
        </div>

        <ExternalProviders :providers="loginProviders" />
      </div>

      <!-- Extensions after form -->
      <template
        v-for="extension in afterLoginFormExtensions"
        :key="extension.id"
      >
        <div class="vc-login-page__extension">
          <component :is="extension.component" />
        </div>
      </template>
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
              class="vc-login-page__input"
              :label="t('LOGIN.FIELDS.FORGOT_PASSWORD.LABEL')"
              :placeholder="t('LOGIN.FIELDS.FORGOT_PASSWORD.PLACEHOLDER')"
              :hint="t('LOGIN.RESET_EMAIL_TEXT')"
              required
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            ></VcInput>
          </Field>
          <div class="vc-login-page__forgot-form-buttons">
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
        <div class="vc-login-page__button-container">
          <span
            v-if="$isDesktop.value"
            class="vc-login-page__spacer"
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
      class="vc-login-page__error-hint"
    >
      <!-- TODO: stylizing-->
      {{ signInResult.error }}
    </VcHint>
    <VcHint
      v-if="!requestPassResult.succeeded"
      class="vc-login-page__error-hint"
    >
      <!-- TODO: stylizing-->
      {{ requestPassResult.error }}
    </VcHint>
  </VcLoginForm>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, Ref, inject } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useIsFormDirty, useForm } from "vee-validate";
import { useSettings } from "./../../../../../core/composables";
import { useUserManagement } from "./../../../../../core/composables/useUserManagement";
import { RequestPasswordResult } from "./../../../../../core/types";
import { ExternalSignInProviderInfo, SignInResult } from "./../../../../../core/api/platform";
import { useI18n } from "vue-i18n";
import { default as ExternalProviders } from "./../../../../../shared/components/sign-in/external-providers.vue";
import { useExternalProvider } from "./../../../../../shared/components/sign-in/useExternalProvider";
import { Extension, ExtensionPoint, extensionsHelperSymbol } from "./../../../../../core/plugins";

type ForgotPasswordFunc = (args: { loginOrEmail: string }) => Promise<void>;

export interface Props {
  logo: string;
  background: string;
  title: string;
  composable?: () => { forgotPassword: ForgotPasswordFunc };
}

const props = defineProps<Props>();

const router = useRouter();

const { validateField } = useForm({ validateOnMount: false });
const { uiSettings, loading: customizationLoading } = useSettings();
const { t } = useI18n({ useScope: "global" });
let useLogin;
const signInResult = ref({ succeeded: true }) as Ref<SignInResult & { status?: number; error?: any }>;
const requestPassResult = ref<RequestPasswordResult>({ succeeded: true });
const forgotPasswordRequestSent = ref(false);
const { signIn, loading, user } = useUserManagement();
const { getProviders } = useExternalProvider();

const isLogin = ref(true);
const isValid = useIsFormValid();
const isDirty = useIsFormDirty();

const loadingForgotPassword = ref(false);
const loginProviders = ref<ExternalSignInProviderInfo[]>();
let forgotPassword: ForgotPasswordFunc;

const extensionsHelper = inject(extensionsHelperSymbol);

const afterLoginFormExtensions = computed(
  (): ExtensionPoint[] => (extensionsHelper?.getOutboundExtensions("login-after-form") as ExtensionPoint[]) || [],
);

if (props.composable && typeof props.composable === "function") {
  useLogin = props.composable;

  if (useLogin) {
    const { forgotPassword: forgot } = useLogin();
    forgotPassword = forgot;
  }
}

onMounted(async () => {
  loginProviders.value = await getProviders();
});

const customization = computed(() => {
  return {
    logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
  };
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
    signInResult.value.error = "";
    signInResult.value = (await signIn(form.username, form.password)) as SignInResult & {
      status?: number;
      error?: any;
    };

    if (signInResult.value.succeeded && user.value?.passwordExpired) {
      await router.push({ name: "ChangePassword" });
    } else {
      if (signInResult.value.succeeded) {
        const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        await router.push(redirectTo);
      } else {
        signInResult.value.error = "The login or password is incorrect.";
        form.password = "";
        validateField("password");

        if (signInResult.value.status) {
          if (signInResult.value.status === 401) {
            signInResult.value.error = "The login or password is incorrect.";
            form.password = "";
            validateField("password");
          } else {
            signInResult.value.error = "Authentication error (code: " + signInResult.value.status + ").";
          }
        } else {
          signInResult.value.error = "Authentication error: " + signInResult.value.error;
        }
      }
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
  signInResult.value.error = "";
  if (isLogin.value) {
    forgotPasswordRequestSent.value = false;
    forgotPasswordForm.loginOrEmail = "";
    requestPassResult.value.error = "";
  }
};

console.debug("Init login-page");
</script>

<style lang="scss">
:root {
  --login-separator: var(--secondary-200);
  --login-separator-text: var(--primary-300);
  --login-error: var(--danger-500);
}

.vc-login-page {
  &__input {
    @apply tw-mb-4 tw-mt-1;
  }

  &__input--small {
    @apply tw-mb-4;
  }

  &__forgot-password-container {
    @apply tw-flex tw-justify-end tw-items-center tw-pt-2;
  }

  &__button-container {
    @apply tw-flex tw-justify-center tw-items-center tw-pt-2;
  }

  &__submit-button {
    @apply tw-w-28;
  }

  &__extension {
    @apply tw-mt-6 tw-pt-6 tw-border-t tw-border-t-[color:var(--login-separator)] tw-flex tw-justify-center;
  }

  &__separator {
    @apply tw-mt-4;
  }

  &__separator-line {
    @apply tw-flex tw-items-center tw-text-center tw-uppercase tw-text-[color:var(--login-separator-text)] before:tw-content-[''] before:tw-flex-1 before:tw-border-b before:tw-border-b-[color:var(--login-separator)] before:tw-mr-2 after:tw-content-[''] after:tw-flex-1 after:tw-border-b after:tw-border-b-[color:var(--login-separator)] after:tw-ml-2;
  }

  &__error-hint {
    @apply tw-mt-3 tw-text-[color:var(--login-error)];
  }

  &__forgot-form-buttons {
    @apply tw-flex tw-justify-between tw-items-center tw-pt-2;
  }

  &__spacer {
    @apply tw-grow tw-basis-0;
  }
}
</style>
