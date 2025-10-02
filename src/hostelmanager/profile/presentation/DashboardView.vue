<template>
  <div class="dashboard">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="p-card-title">{{ $t('dashboard.title') }}</div>
        <div class="p-card-content">
          <h2>{{ $t('dashboard.welcome', { name: user?.name || '' }) }}</h2>
          <p>{{ isOwner ? $t('dashboard.ownerMessage') : $t('dashboard.visitorMessage') }}</p>

          <Message v-if="isOwner && !hasSubscription" severity="warn" :closable="false">
            <div>
              <i class="pi pi-exclamation-circle mr-2"></i>
              <span>{{ $t('subscriptions.required') }}</span>
              <Button
                  :label="$t('subscriptions.subscribe')"
                  class="p-button-sm p-button-text ml-3"
                  @click="goToSubscriptions"
              />
            </div>
          </Message>
        </div>
      </div>
    </div>

    <div v-if="isOwner" class="grid">
      <div class="col-12 md:col-4">
        <div class="p-card p-shadow-2 stats-card">
          <div class="p-card-body">
            <div class="stat-icon">
              <i class="pi pi-building"></i>
            </div>
            <div class="stat-content">
              <h3>{{ hotelsCount }}</h3>
              <p>{{ $t('dashboard.stats.hotels') }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="p-card p-shadow-2 stats-card">
          <div class="p-card-body">
            <div class="stat-icon">
              <i class="pi pi-key"></i>
            </div>
            <div class="stat-content">
              <h3>{{ roomsCount }}</h3>
              <p>{{ $t('dashboard.stats.rooms') }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="p-card p-shadow-2 stats-card">
          <div class="p-card-body">
            <div class="stat-icon">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-content">
              <h3>{{ reservationsCount }}</h3>
              <p>{{ $t('dashboard.stats.reservations') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="p-card p-shadow-2">
        <div class="p-card-body">
          <div class="p-card-title mb-3">{{ $t('hotels.list') }}</div>

          <div class="p-input-icon-left mb-4 w-full">
            <i class="pi pi-search"></i>
            <InputText
                v-model="searchQuery"
                :placeholder="$t('common.search')"
                class="w-full"
            />
          </div>

          <Paginator
              v-if="paginatedHotels.length > 0"
              :rows="rowsPerPage"
              :totalRecords="filteredHotels.length"
              :rowsPerPageOptions="[6, 12, 18]"
              @page="onPage"
              :first="first"
              class="mb-3"
          />

          <div v-if="loading" class="flex justify-content-center my-5">
            <ProgressSpinner />
          </div>
          <div v-else-if="filteredHotels.length === 0" class="text-center my-5">
            <div class="mb-3">
              <i class="pi pi-info-circle" style="font-size: 2rem"></i>
            </div>
            <p>{{ $t('hotels.noHotels') }}</p>
          </div>
          <div v-else>
            <div class="grid">
              <div
                  v-for="hotel in paginatedHotels"
                  :key="hotel.id"
                  class="col-12 md:col-4 lg:col-3"
              >
                <div class="p-card p-shadow-2 m-2 hotel-card">
                  <div class="p-card-body">
                    <img :src="hotel.image" :alt="hotel.name" class="hotel-image" />
                    <div class="hotel-name">{{ hotel.name }}</div>
                    <div class="hotel-address">{{ hotel.address }}</div>

                    <p class="text-sm text-600 overflow-hidden text-overflow-ellipsis whitespace-nowrap mb-3">
                      {{ hotel.description }}
                    </p>

                    <div class="mt-auto flex justify-content-end">
                      <Button
                          :label="$t('hotels.view')"
                          icon="pi pi-eye"
                          class="p-button-sm p-button-info"
                          @click="viewHotel(hotel.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Paginator
              v-if="paginatedHotels.length > 0"
              :rows="rowsPerPage"
              :totalRecords="filteredHotels.length"
              :rowsPerPageOptions="[6, 12, 18]"
              @page="onPage"
              :first="first"
              class="mt-3"
          />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { UserRepository } from '../infrastructure/UserRepository';
import { HotelRepository } from '../../hotels/infrastructure/HotelRepository';
import { RoomRepository } from '../../room/infrastructure/RoomRepository';
import { ReservationRepository } from '../../reservation/infrastructure/ReservationRepository';

// Composables
const router = useRouter();
const { t } = useI18n();

// Repositorios
const userRepository = new UserRepository();
const hotelRepository = new HotelRepository();
const roomRepository = new RoomRepository();
const reservationRepository = new ReservationRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const loading = ref(true);
const hotels = ref([]);
const rooms = ref([]);
const reservations = ref([]);
const searchQuery = ref('');

// Estado de paginación
const rowsPerPage = ref(6);
const first = ref(0); // Índice del primer registro para la paginación

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const hasSubscription = computed(() => user.value?.subscription_id !== null);

const hotelsCount = computed(() => isOwner.value ? hotels.value.length : 0);
const roomsCount = computed(() => isOwner.value ? rooms.value.length : 0);
const reservationsCount = computed(() => reservations.value.length);

const filteredHotels = computed(() => {
  let result = hotels.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(hotel =>
        hotel.name.toLowerCase().includes(query) ||
        hotel.address.toLowerCase().includes(query) ||
        hotel.description?.toLowerCase().includes(query)
    );
  }

  // Resetea la paginación a la primera página si cambia el filtro
  if (first.value > 0 && result.length < first.value) {
    first.value = 0;
  }

  return result;
});

// Implementación de la paginación manual
const paginatedHotels = computed(() => {
  const start = first.value;
  const end = first.value + rowsPerPage.value;
  return filteredHotels.value.slice(start, end);
});


// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    if (isOwner.value) {
      // Cargar hoteles del propietario
      hotels.value = await hotelRepository.findByOwnerId(String(user.value.id));

      // Cargar todas las habitaciones de los hoteles del propietario
      const roomsPromises = hotels.value.map(hotel =>
          roomRepository.findByHotelId(String(hotel.id))
      );
      const roomsArrays = await Promise.all(roomsPromises);
      rooms.value = roomsArrays.flat().filter(Boolean);
      
    } else {
      // Para visitantes, cargar todos los hoteles
      hotels.value = await hotelRepository.findAll();
    }

    // Cargar reservaciones del usuario
    reservations.value = await reservationRepository.findByUserId(String(user.value.id));
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

const goToSubscriptions = () => {
  router.push('/subscriptions');
};

const viewHotel = (id) => {
  router.push(`/hotels/${String(id)}`);
};

// Manejador del evento de paginación
const onPage = (event) => {
  first.value = event.first;
  rowsPerPage.value = event.rows;
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

/* --- Estilos para Estadísticas (Owner) --- */
.stats-card .p-card-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.stat-icon {
  background-color: #e6f7ff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 1.5rem;
  color: #4f86c6;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
}

/* --- Estilos para Cards de Hotel (Visitor) --- */
.hotel-card {
  height: 100%;
}

.hotel-card .p-card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Asegura que el botón se alinea al final */
  justify-content: space-between;
}

.hotel-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.hotel-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hotel-address {
  color: #666;
  margin-bottom: 0.5rem;
}

/* Media Queries */
@media (max-width: 768px) {
  .stats-card .p-card-body {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
  }
}
</style>