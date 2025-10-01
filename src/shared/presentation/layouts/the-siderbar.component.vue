<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <i class="pi pi-th-large"></i>
      <span>Menu</span>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-home"></i>
            <span>{{ $t('sidebar.home') }}</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-building"></i>
            <span>{{ $t('sidebar.hotels') }}</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-key"></i>
            <span>{{ $t('sidebar.rooms') }}</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-calendar"></i>
            <span>{{ $t('sidebar.reservations') }}</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-user"></i>
            <span>{{ $t('sidebar.profiles') }}</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-credit-card"></i>
            <span>{{ $t('sidebar.subscriptions') }}</span>
          </a>
        </li>
        <li>
          <a href="#" class="nav-link">
            <i class="pi pi-cog"></i>
            <span>{{ $t('sidebar.settings') }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 20px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #4f86c6;
  font-weight: 600;
  font-size: 1.1rem;
}

.sidebar-header i {
  font-size: 1.2rem;
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin: 5px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  text-decoration: none;
  color: #555;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-link i {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  color: #7b98b2;
}

.nav-link:hover {
  background-color: #f0f7ff;
  color: #4f86c6;
  border-left-color: #4f86c6;
}

.nav-link:hover i {
  color: #4f86c6;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }

  .nav-link {
    padding: 10px 15px;
  }

  .sidebar-header {
    padding: 15px;
  }
}
</style>