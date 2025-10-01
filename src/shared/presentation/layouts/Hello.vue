<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <div class="welcome-header">
        <i class="pi pi-home welcome-icon"></i>
        <h2>{{ $t('welcome.message') }}</h2>
      </div>
      <div class="welcome-content">
        <p>Esta plataforma le permite gestionar de forma eficiente sus hostales, habitaciones y reservas.</p>
        <div class="quick-stats">
          <div class="stat-card">
            <i class="pi pi-building"></i>
            <span class="stat-value">5</span>
            <span class="stat-label">Hostales</span>
          </div>
          <div class="stat-card">
            <i class="pi pi-key"></i>
            <span class="stat-value">24</span>
            <span class="stat-label">Habitaciones</span>
          </div>
          <div class="stat-card">
            <i class="pi pi-calendar"></i>
            <span class="stat-value">12</span>
            <span class="stat-label">Reservas</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.welcome-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  overflow: hidden;
}

.welcome-header {
  background-color: #f0f7ff;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #e6f0f9;
}

.welcome-icon {
  font-size: 2rem;
  color: #4f86c6;
}

.welcome-header h2 {
  color: #4f86c6;
  margin: 0;
  font-weight: 500;
}

.welcome-content {
  padding: 25px;
}

.welcome-content p {
  color: #666;
  line-height: 1.6;
  margin-top: 0;
  margin-bottom: 30px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background-color: #f9fbfe;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #edf2f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(79, 134, 198, 0.1);
}

.stat-card i {
  color: #4f86c6;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #777;
  margin-top: 5px;
}

@media (max-width: 600px) {
  .quick-stats {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .welcome-header {
    padding: 15px;
  }

  .welcome-content {
    padding: 15px;
  }
}
</style>