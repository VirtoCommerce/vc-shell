<template>
  <nav class="navbar navbar-dark navbar-expand bg-dark p-0">
    <div class="main-menu d-flex align-items-center">
      <a class="navbar-brand px-3 mr-2" href="#">
        <img src="~/assets/logo.svg" class="d-inline-block align-top" />
      </a>
      <small class="text-muted">3.0.0</small>
    </div>
    <div class="mr-auto"></div>
    <ul class="navbar-nav">
      <li class="nav-item dropdown">
        <a id="account-actions" class="nav-link d-flex align-items-center">
          <span class="account-info d-flex">
            <img src="~/assets/userpic.svg" />
            <span class="d-inline-block ml-4">
              <span class="d-block text-white">Admin</span>
              <span class="d-block text-muted">Administrator</span>
            </span>
          </span>
        </a>
      </li>
    </ul>
  </nav>
</template>
<script>
export default {
  name: 'VcHeader',
  props: {},
  computed: {},
}
</script>
<style lang="scss"></style>
