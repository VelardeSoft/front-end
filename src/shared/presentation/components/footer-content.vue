<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <footer class="footer">
    <p>
      {{ t('footer.description')}} <i class="pi pi-heart"/>
    </p>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #8c53d3;
  color: white;
  padding: 10px;
  text-align: center;
}
</style>