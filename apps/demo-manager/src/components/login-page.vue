<template>
  <vc-layout-login :branding="branding">
    <vc-form>
      <vc-form-field class="vc-margin-bottom_l" label="Login">
        <vc-form-input></vc-form-input>
      </vc-form-field>
      <vc-form-field class="vc-margin-bottom_l" label="Password">
        <vc-form-input type="password"></vc-form-input>
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
        <vc-button variant="special" @click="tryLogin">Log in</vc-button>
      </div>
    </vc-form>
  </vc-layout-login>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "@virtoshell/core";

export default defineComponent({
  props: {
    branding: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    console.debug("Init login-page");
    const router = useRouter();

    function tryLogin() {
      router.push("/orders");
    }

    return {
      tryLogin,
    };
  },
});
</script>
