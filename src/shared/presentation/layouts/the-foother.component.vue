<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-logo">
          <i class="pi pi-building"></i>
          <span>HostelManager</span>
        </div>
        <p class="copyright">{{ $t('footer.copyright') }}</p>
      </div>
      <div class="footer-links">
        <a href="#" class="footer-link">
          <i class="pi pi-facebook"></i>
        </a>
        <a href="#" class="footer-link">
          <i class="pi pi-twitter"></i>
        </a>
        <a href="#" class="footer-link">
          <i class="pi pi-instagram"></i>
        </a>
        <a href="#" class="footer-link">
          <i class="pi pi-linkedin"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  width: 100%;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4f86c6;
  font-weight: 600;
}

.footer-logo i {
  font-size: 1.2rem;
}

.copyright {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 15px;
}

.footer-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e6f0f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f86c6;
  text-decoration: none;
  transition: all 0.2s;
}

.footer-link:hover {
  background-color: #4f86c6;
  color: white;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .footer-content {
    align-items: center;
  }

  .footer-links {
    margin-top: 10px;
  }
}
</style>