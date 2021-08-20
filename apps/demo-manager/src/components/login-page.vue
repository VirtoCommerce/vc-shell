<template>
  <vc-layout-login :branding="branding">
    <vc-form>
      <vc-form-field class="vc-margin-bottom_l" label="Login">
        <vc-form-input v-model="form.username"></vc-form-input>
      </vc-form-field>
      <vc-form-field class="vc-margin-bottom_l" label="Password">
        <vc-form-input v-model="form.password" type="password"></vc-form-input>
      </vc-form-field>
      <div
        class="
          vc-margin-bottom_l
          vc-flex
          vc-flex-justify_space-between
          vc-flex-align_center
        "
      >
        <vc-form-checkbox>Remember me</vc-form-checkbox>
        <vc-link>Forgot your password?</vc-link>
      </div>
      <div class="vc-flex vc-flex-justify_space-between vc-flex-align_center">
        <vc-link>Sign in with Azure Active Directory</vc-link>
        <vc-button variant="primary" @click="login">Log in</vc-button>
      </div>
    </vc-form>
  </vc-layout-login>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter, useLogger, useUser } from "@virtoshell/core";

export default defineComponent({
  props: {
    branding: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    const log = useLogger();
    const router = useRouter();

    const { signIn, accessToken } = useUser();
    const form = {
      username: "",
      password: "",
    };

    const login = async () => {
      await signIn(form.username, form.password);
      if (accessToken.value) {
        router.push("/orders");
      }
    };

    log.debug("Init login-page");

    return {
      form,
      login,
    };
  },
});
</script>
