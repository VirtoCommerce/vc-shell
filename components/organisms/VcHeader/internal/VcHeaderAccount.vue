<template>
  <div class="vc-header__account">
    <a
      href="#"
      class="vc-header__account__user-block"
      data-bs-toggle="dropdown"
      aria-expanded="true"
    >
      <VcImage
        :src="avatar"
        width="48"
        height="48"
        class="rounded-circle mx-3"
      />
      <span class="account-user__info">
        <span class="vc-header__account__user-name">{{ name }}</span>
        <span class="vc-header__account__user-role">{{ role }}</span>
      </span>
    </a>
  </div>
</template>
<script>
import { VcImage } from '~/components/atoms'
export default {
  name: 'VcHeaderAccount',
  components: { VcImage },
  props: {
    avatar: {
      type: String,
      default: require('~/assets/img/userpic.svg'),
      required: false,
    },
    name: {
      type: String,
      default: '',
      required: false,
    },
    role: {
      type: String,
      default: '',
      required: false,
    },
  },
  computed: {},
}
</script>
