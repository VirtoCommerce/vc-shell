<template>
  <div
    class="vc-app vc-fill_all vc-flex vc-flex-column vc-margin_none vc-theme_light"
  >
    <vc-loading v-if="loading" active></vc-loading>

    <vc-login-form
      logo="/assets/logo-white.svg"
      background="/assets/background.jpg"
      :title="$t('SHELL.INVITATION.TITLE')"
    >
      <vc-form>
        <vc-input
          ref="userName"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.INVITATION.FIELDS.USER_NAME.LABEL')"
          :modelValue="userName"
          :disabled="true"
        ></vc-input>
        <vc-input
          ref="passwordField"
          class="vc-margin-bottom_l vc-margin-top_xs"
          :label="$t('SHELL.INVITATION.FIELDS.PASSWORD.LABEL')"
          :placeholder="$t('SHELL.INVITATION.FIELDS.PASSWORD.PLACEHOLDER')"
          type="password"
          :required="true"
          :disabled="!form.tokenIsValid"
          v-model="form.password"
          @update:modelValue="validate()"
        ></vc-input>
        <vc-input
          ref="confirmPasswordField"
          class="vc-margin-bottom_l"
          :label="$t('SHELL.INVITATION.FIELDS.CONFIRM_PASSWORD.LABEL')"
          :placeholder="
            $t('SHELL.INVITATION.FIELDS.CONFIRM_PASSWORD.PLACEHOLDER')
          "
          :required="true"
          :disabled="!form.tokenIsValid"
          v-model="form.confirmPassword"
          type="password"
          @update:modelValue="validate()"
          @keyup.enter="changePassword"
        ></vc-input>
        <div
          class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding-top_s"
        >
          <span v-if="$isDesktop.value" class="vc-flex-grow_1"></span>
          <vc-button
            variant="primary"
            :disabled="loading || !form.tokenIsValid || !form.isValid"
            @click="acceptInvitation"
          >
            {{ $t("SHELL.INVITATION.ACCEPT_INVITATION") }}
          </vc-button>
        </div>

        <vc-hint
          class="vc-margin-top_m"
          style="color: #f14e4e"
          v-for="error in form.errors"
          :key="error"
        >
          <!-- TODO: stylizing-->
          {{ $t(`SHELL.INVITATION.ERRORS.${error}`) }}
        </vc-hint>
      </vc-form>
    </vc-login-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from "vue";
import { useUser } from "@virtoshell/core";
import { useRouter } from "vue-router";

const props = defineProps({
  userId: {
    type: String,
    default: undefined,
  },
  userName: {
    type: String,
    default: undefined,
  },
  token: {
    type: String,
    default: undefined,
  },
});
const {
  validateToken,
  validatePassword,
  resetPasswordByToken,
  signIn,
  loading,
} = useUser();
const router = useRouter();

const form = reactive({
  isValid: false,
  tokenIsValid: false,
  errors: [],
  password: "",
  confirmPassword: "",
});

onMounted(async () => {
  form.tokenIsValid = await validateToken(props.userId, props.token);
  if (!form.tokenIsValid) {
    form.errors.push("Invalid-token");
  }
});

const validate = async () => {
  if (form.tokenIsValid) {
    var errors = (await validatePassword(form.password)).errors;
    form.errors = errors.map((x) => x.code);
    if (form.confirmPassword && form.confirmPassword !== form.password) {
      form.errors.push("Repeat-password");
    }
    form.isValid = form.errors.length == 0;
  }
};

const acceptInvitation = async () => {
  var result = await resetPasswordByToken(
    props.userId,
    form.password,
    props.token
  );
  if (result.succeeded) {
    const result = await signIn(props.userName, form.password);
    if (result.succeeded) {
      router.push("/");
    } else {
      form.errors = [result.errorCode];
    }
  } else {
    form.errors = result.errors;
  }
};
</script>
