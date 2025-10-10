<script setup>
import { useI18n } from "vue-i18n"
const { t } = useI18n();
import LanguageSwitcher from "./language-switcher.vue";
</script>

<template>
  <header class="header">
    <h1>{{ t('header.title')}}</h1>
    <LanguageSwitcher/>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #807e7e;
  color: white;
  padding: 10px;
}
</style>