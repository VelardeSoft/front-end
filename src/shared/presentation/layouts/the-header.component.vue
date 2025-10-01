<template>
  <header class="header">
    <div class="header-container">
      <div class="logo-container">
        <img width="317" height="51" alt="Issue image" src="https://github.com/user-attachments/assets/03eea7f6-3366-4ac6-af4d-7f01b364db8b" />
        <!--
        <i class="pi pi-building logo-icon"></i>
        <h1>{{ $t('header.title') }}</h1> -->
      </div>
      <div class="header-actions">
        <div class="language-selector">
          <button @click="changeLanguage('es')" :class="{ active: currentLocale === 'es' }">ES</button>
          <button @click="changeLanguage('en')" :class="{ active: currentLocale === 'en' }">EN</button>
        </div>
        <div class="user-menu">
          <i class="pi pi-user"></i>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const currentLocale = computed(() => locale.value);

function changeLanguage(lang) {
  locale.value = lang;
}
</script>

<style scoped>
.header {
  background-color: #ffffff;
  color: #333;
  padding: 10px 20px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 1.8rem;
  color: #4f86c6;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 500;
  color: #4f86c6;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-selector {
  display: flex;
  gap: 5px;
}

.language-selector button {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  color: #777;
  transition: all 0.2s;
}

.language-selector button.active {
  background-color: #4f86c6;
  color: white;
  border-color: #4f86c6;
}

.user-menu {
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  background-color: #f0f7ff;
  color: #4f86c6;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.2rem;
  }

  .header-actions {
    gap: 10px;
  }

  .language-selector button {
    padding: 3px 6px;
    font-size: 0.8rem;
  }
}
</style>