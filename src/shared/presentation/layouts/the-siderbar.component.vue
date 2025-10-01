<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <i class="pi pi-th-large"></i>
      <span>Menu</span>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li>
          <router-link to="/dashboard" class="nav-link">
            <i class="pi pi-home"></i>
            <span>{{ $t('sidebar.home') }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/hotels" class="nav-link">
            <i class="pi pi-building"></i>
            <span>{{ $t('sidebar.hotels') }}</span>
          </router-link>
        </li>
        <li v-if="hasHotels">
          <router-link :to="`/hotels/${currentHotelId}/rooms`" class="nav-link">
            <i class="pi pi-key"></i>
            <span>{{ $t('sidebar.rooms') }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/reservations" class="nav-link">
            <i class="pi pi-calendar"></i>
            <span>{{ $t('sidebar.reservations') }}</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile" class="nav-link">
            <i class="pi pi-user"></i>
            <span>{{ $t('sidebar.profiles') }}</span>
          </router-link>
        </li>
        <li v-if="isOwner">
          <router-link to="/subscriptions" class="nav-link">
            <i class="pi pi-credit-card"></i>
            <span>{{ $t('sidebar.subscriptions') }}</span>
          </router-link>
        </li>
        <li class="logout-item">
          <a href="#" class="nav-link logout-link" @click.prevent="logout">
            <i class="pi pi-sign-out"></i>
            <span>{{ $t('sidebar.logout') }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { UserRepository } from '../../../hostelmanager/profile/infrastructure/UserRepository';
import { HotelRepository } from '../../../hostelmanager/hotels/infrastructure/HotelRepository';

// Composables
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const userRepository = new UserRepository();
const hotelRepository = new HotelRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const hotels = ref([]);
const loading = ref(false);

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const hasHotels = computed(() => hotels.value.length > 0);
const currentHotelId = computed(() => {
  if (hotels.value.length > 0) {
    return hotels.value[0].id;
  }
  return null;
});

// Métodos
const loadUserHotels = async () => {
  if (isOwner.value && user.value) {
    loading.value = true;
    try {
      hotels.value = await hotelRepository.findByOwnerId(user.value.id);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      loading.value = false;
    }
  }
};

const logout = () => {
  // Eliminar todos los datos de localStorage
  localStorage.clear();

  // Mostrar mensaje de éxito
  toast.add({
    severity: 'success',
    summary: t('common.success'),
    detail: t('auth.logout'),
    life: 3000
  });

  // Redirigir al login
  router.push('/login');
};

// Al montar el componente
onMounted(() => {
  loadUserHotels();
});
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
  display: flex;
  flex-direction: column;
}

.sidebar-nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.sidebar-nav li {
  margin: 5px 0;
}

.logout-item {
  margin-top: auto;
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

.nav-link:hover, .router-link-active {
  background-color: #f0f7ff;
  color: #4f86c6;
  border-left-color: #4f86c6;
}

.nav-link:hover i, .router-link-active i {
  color: #4f86c6;
}

.logout-link {
  color: #e57373;
}

.logout-link i {
  color: #e57373;
}

.logout-link:hover {
  background-color: #ffeaec;
  color: #d32f2f;
  border-left-color: #d32f2f;
}

.logout-link:hover i {
  color: #d32f2f;
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