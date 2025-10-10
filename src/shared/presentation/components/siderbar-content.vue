<script setup>
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li><RouterLink to="/"><pv-button :label="t('siderbar.profile')" icon="pi pi-user" /></RouterLink></li>
        <li><RouterLink to="/security"><pv-button label="Profile" icon="pi pi-user" /></RouterLink></li>
        <li><RouterLink to="/tutorial"><pv-button label="Profile" icon="pi pi-user" /></RouterLink></li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 180px;
  border-right: 2px solid #6c6b6b;
  padding: 15px;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}
.sidebar ul li {
  margin: 10px 0;
}
</style>