<template>
  <VcAuthLayout
    :logo="customization.logo"
    :background="background"
    :title="title || $t('LOGIN.TITLE')"
    :subtitle="subtitle || $t('LOGIN.SUBTITLE')"
    class="vc-login-page"
  >
    <!-- SSO Providers -->
    <div
      v-if="loginProviders && loginProviders.length"
      class="vc-login-page__providers"
    >
      <ExternalProviders :providers="loginProviders" />

      <div
        v-if="!ssoOnly"
        class="vc-login-page__separator-line"
      >
        {{ $t("LOGIN.OR") }}
      </div>
    </div>

    <!-- SSO-only error: no providers configured -->
    <VcHint
      v-if="ssoOnly && providersLoaded && !loginProviders?.length"
      class="tw-mt-4 tw-text-danger-500"
    >
      {{ $t("LOGIN.SSO_NO_PROVIDERS_ERROR") }}
    </VcHint>

    <template v-if="!ssoOnly">
      <VcForm
        @submit="login"
        class="tw-gap-5"
      >
        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :label="$t('LOGIN.FIELDS.LOGIN.LABEL')"
          name="username"
          :model-value="form.username"
          rules="required"
        >
          <VcInput
            ref="loginField"
            v-model="form.username"
            :label="$t('LOGIN.FIELDS.LOGIN.LABEL')"
            :placeholder="$t('LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @update:model-value="handleChange"
          />
        </Field>

        <Field
          v-slot="{ errorMessage, handleChange, errors }"
          :label="$t('LOGIN.FIELDS.PASSWORD.LABEL')"
          name="password"
          :model-value="form.password"
          rules="required"
        >
          <VcInput
            ref="passwordField"
            v-model="form.password"
            :label="$t('LOGIN.FIELDS.PASSWORD.LABEL')"
            :placeholder="$t('LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
            type="password"
            required
            :error="!!errors.length"
            :error-message="errorMessage"
            @keyup.enter="login"
            @update:model-value="handleChange"
          />
        </Field>

        <VcButton
          variant="primary"
          class="tw-w-full"
          icon="lucide-log-in"
          :disabled="!isValid"
          :loading="loading"
          @click="login"
        >
          {{ $t("LOGIN.BUTTON") }}
        </VcButton>

        <VcButton
          variant="link"
          class="tw-w-full tw-justify-center"
          type="button"
          @click="goToForgotPassword"
        >
          {{ $t("LOGIN.FORGOT_PASSWORD_BUTTON") }}
        </VcButton>
      </VcForm>

      <!-- Plugin extension point -->
      <ExtensionPoint
        name="auth:after-form"
        separator
        separator-class="tw-border-t tw-border-[color:var(--login-separator)] tw-border-solid tw-pb-5"
        wrapper-class="vc-login-page__separator"
      />

      <VcHint
        v-if="!signInResult.succeeded"
        class="tw-mt-4 tw-text-danger-500"
      >
        {{ signInResult.error }}
      </VcHint>
    </template>
  </VcAuthLayout>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, Ref } from "vue";
import { useRouter } from "vue-router";
import { useIsFormValid, Field, useForm } from "vee-validate";
import { useSettings } from "@core/composables";
import { useUserManagement } from "@core/composables/useUserManagement";
import { ExternalSignInProviderInfo, SignInResult } from "@core/api/platform";
import { default as ExternalProviders } from "@shell/auth/sign-in/external-providers.vue";
import { useExternalProvider } from "@shell/auth/sign-in/useExternalProvider";
import { ExtensionPoint } from "@core/plugins/extension-points";
import { createLogger } from "@core/utilities";

const logger = createLogger("login-page");

export interface Props {
  logo?: string;
  background?: string;
  title?: string;
  subtitle?: string;
  ssoOnly?: boolean;
}

const props = defineProps<Props>();

const router = useRouter();

const { validateField } = useForm({ validateOnMount: false });
const { uiSettings, loading: customizationLoading } = useSettings();
const signInResult = ref({ succeeded: true }) as Ref<SignInResult & { status?: number; error?: any }>;
const { signIn, loading, user } = useUserManagement();
const { getProviders } = useExternalProvider();
const isValid = useIsFormValid();
const loginProviders = ref<ExternalSignInProviderInfo[]>();
const providersLoaded = ref(false);

onMounted(async () => {
  loginProviders.value = await getProviders();
  providersLoaded.value = true;
});

const customization = computed(() => ({
  logo: !customizationLoading.value ? uiSettings.value?.logo || props.logo : "",
}));

const form = reactive({
  username: "",
  password: "",
});

const login = async () => {
  if (!isValid.value) return;

  signInResult.value.error = "";
  signInResult.value = (await signIn(form.username, form.password)) as SignInResult & {
    status?: number;
    error?: any;
  };

  if (signInResult.value.succeeded && user.value?.passwordExpired) {
    await router.push({ name: "ChangePassword" });
    return;
  }

  if (signInResult.value.succeeded) {
    const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
    localStorage.removeItem("redirectAfterLogin");
    await router.push(redirectTo);
    return;
  }

  // Error handling
  if (signInResult.value.status === 401) {
    signInResult.value.error = "The login or password is incorrect.";
  } else if (signInResult.value.status) {
    signInResult.value.error = "Authentication error (code: " + signInResult.value.status + ").";
  } else if (signInResult.value.error) {
    signInResult.value.error = "Authentication error: " + signInResult.value.error;
  } else {
    signInResult.value.error = "The login or password is incorrect.";
  }

  form.password = "";
  validateField("password");
};

const goToForgotPassword = () => {
  router.push({ name: "ForgotPassword" });
};

logger.debug("Init login-page");
</script>

<style lang="scss">
:root {
  --login-separator: var(--secondary-200);
  --login-separator-text: var(--neutrals-400);
}

.vc-login-page {
  &__separator {
    @apply tw-mt-5;
  }

  &__separator-line {
    @apply tw-flex tw-items-center tw-text-center tw-text-xs tw-text-[color:var(--login-separator-text)]
      before:tw-content-[''] before:tw-flex-1 before:tw-border-b before:tw-border-b-[color:var(--login-separator)] before:tw-mr-3
      after:tw-content-[''] after:tw-flex-1 after:tw-border-b after:tw-border-b-[color:var(--login-separator)] after:tw-ml-3;
    @apply tw-my-4;
  }
}
</style>
