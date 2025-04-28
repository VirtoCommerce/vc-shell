<template>
  <div class="icon-examples">
    <h2>Examples of Using Different Icon Libraries</h2>

    <div class="icon-section">
      <h3>Font Awesome Icons</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <VcIcon icon="fas fa-home" />
          <span>fas fa-home</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="far fa-user" />
          <span>far fa-user</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="fas fa-cog"
            size="xl"
          />
          <span>fas fa-cog (xl)</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="fas fa-exclamation-triangle"
            variant="warning"
          />
          <span>fas fa-exclamation-triangle (warning)</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>Material Icons</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <VcIcon icon="material-home" />
          <span>material-home</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="material-person" />
          <span>material-person</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="material-settings"
            size="xl"
          />
          <span>material-settings (xl)</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="material-warning"
            variant="warning"
          />
          <span>material-warning (warning)</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>Bootstrap Icons</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <VcIcon icon="bi-house" />
          <span>bi-house</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="bi-person" />
          <span>bi-person</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="bi-gear"
            size="xl"
          />
          <span>bi-gear (xl)</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="bi-exclamation-triangle"
            variant="warning"
          />
          <span>bi-exclamation-triangle (warning)</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>Lucide Icons</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <VcIcon
            icon="HomeIcon"
            type="lucide"
          />
          <span>HomeIcon (legacy format)</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="lucide-home" />
          <span>lucide-home</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="lucide-settings"
            size="xl"
          />
          <span>lucide-settings (xl)</span>
        </div>
        <div class="icon-item">
          <VcIcon
            icon="lucide-alert-triangle"
            variant="warning"
          />
          <span>lucide-alert-triangle (warning)</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>Mixed Usage</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <VcIcon icon="fas fa-home" />
          <span>Font Awesome</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="material-settings" />
          <span>Material</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="bi-gear" />
          <span>Bootstrap</span>
        </div>
        <div class="icon-item">
          <VcIcon icon="lucide-home" />
          <span>Lucide</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VcIcon from "./vc-icon.vue";
</script>

<style lang="scss" scoped>
.icon-examples {
  padding: 20px;
  font-family: sans-serif;
}

.icon-section {
  margin-bottom: 30px;

  h3 {
    margin-bottom: 15px;
    color: #444;
  }
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;

  span {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }
}
</style>
