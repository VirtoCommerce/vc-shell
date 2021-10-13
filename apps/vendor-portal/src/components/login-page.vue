<template>
  <vc-login-form :logo="logo" :background="background" :title="title">
    <vc-form>
      <vc-input
        ref="loginField"
        class="vc-margin-bottom_l vc-margin-top_xs"
        :label="$t('SHELL.LOGIN.FIELDS.LOGIN.LABEL')"
        :placeholder="$t('SHELL.LOGIN.FIELDS.LOGIN.PLACEHOLDER')"
        :required="true"
        v-model="form.username"
      ></vc-input>
      <vc-input
        ref="passwordField"
        class="vc-margin-bottom_l"
        :label="$t('SHELL.LOGIN.FIELDS.PASSWORD.LABEL')"
        :placeholder="$t('SHELL.LOGIN.FIELDS.PASSWORD.PLACEHOLDER')"
        :required="true"
        v-model="form.password"
        type="password"
        @keyup.enter="login"
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
        <vc-button variant="primary" :disabled="loading" @click="login">
          {{ $t("SHELL.LOGIN.BUTTON") }}
        </vc-button>
      </div>
      <vc-hint
        v-if="!signInResult.succeeded"
        class="vc-margin-top_m"
        style="color: #f14e4e"
      >
        <!-- TODO: stylizing-->
        {{ signInResult.error }}
      </vc-hint>
    </vc-form>
  </vc-login-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useLogger, useUser, SignInResult } from "@virtoshell/core";

export default defineComponent({
  props: {
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
  },

  setup() {
    const log = useLogger();
    const signInResult = ref<SignInResult>({ succeeded: true });
    const { signIn, loading } = useUser();
    const form = reactive({
      username: "",
      password: "",
    });

    const login = async () => {
      signInResult.value = await signIn(form.username, form.password);
    };

    log.debug("Init login-page");

    return {
      form,
      login,
      loading,
      signInResult,
    };
  },
});
</script>
