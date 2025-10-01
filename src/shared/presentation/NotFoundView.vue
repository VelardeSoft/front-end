<template>
  <div class="not-found">
    <div class="p-card p-shadow-2 text-center not-found-card">
      <div class="p-card-body">
        <div class="error-icon">
          <i class="pi pi-exclamation-circle"></i>
        </div>
        <h1 class="p-card-title">{{ $t('notFound.title') }}</h1>
        <div class="p-card-content">
          <p>{{ $t('notFound.message') }}</p>
          <Button
            :label="$t('notFound.back')"
            icon="pi pi-home"
            class="p-button-primary mt-3"
            @click="goToHome"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.not-found-card {
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 5rem;
  color: #ff9800;
  margin-bottom: 1rem;
}

.p-card-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.p-card-content p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}
</style>
