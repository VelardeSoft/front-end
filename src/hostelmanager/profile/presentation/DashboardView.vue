<template>
  <div class="dashboard">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="p-card-title">{{ $t('dashboard.title') }}</div>
        <div class="p-card-content">
          <h2>{{ $t('dashboard.welcome', { name: user?.name || '' }) }}</h2>
          <p>{{ isOwner ? $t('dashboard.ownerMessage') : $t('dashboard.visitorMessage') }}</p>

          <!-- Alerta de suscripción para propietarios sin suscripción -->
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

    <!-- Estadísticas para propietarios -->
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

    <!-- Listado de hoteles para visitantes -->
    <div v-else>
      <div class="p-card p-shadow-2">
        <div class="p-card-body">
          <div class="p-card-title mb-3">{{ $t('hotels.list') }}</div>

          <!-- Buscador de hoteles -->
          <div class="p-input-icon-left mb-4 w-full">
            <i class="pi pi-search"></i>
            <InputText
              v-model="searchQuery"
              :placeholder="$t('common.search')"
              class="w-full"
            />
          </div>

          <!-- Listado de hoteles -->
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
            <DataView :value="filteredHotels" :layout="layout" :paginator="true" :rows="6">
              <template #header>
                <div class="grid grid-nogutter">
                  <div class="col-6 text-left">
                    <Button @click="layout = 'grid'" icon="pi pi-th-large" :disabled="layout === 'grid'" />
                    <Button @click="layout = 'list'" icon="pi pi-bars" :disabled="layout === 'list'" />
                  </div>
                </div>
              </template>

              <template #grid="slotProps">
                <div class="col-12 md:col-4">
                  <div class="p-card p-shadow-2 m-2 hotel-card">
                    <div class="p-card-body">
                      <img :src="slotProps.data.image" alt="hotel" class="hotel-image" />
                      <div class="hotel-name">{{ slotProps.data.name }}</div>
                      <div class="hotel-address">{{ slotProps.data.address }}</div>
                      <div class="mt-3">
                        <Button
                          :label="$t('hotels.view')"
                          icon="pi pi-eye"
                          class="p-button-sm"
                          @click="viewHotel(slotProps.data.id)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template #list="slotProps">
                <div class="col-12">
                  <div class="p-card p-shadow-2 m-2">
                    <div class="p-card-body">
                      <div class="flex flex-column md:flex-row">
                        <img :src="slotProps.data.image" alt="hotel" class="hotel-image-list" />
                        <div class="flex-1 flex flex-column align-items-start ml-3">
                          <div class="font-bold text-xl mb-2">{{ slotProps.data.name }}</div>
                          <div class="mb-2">{{ slotProps.data.address }}</div>
                          <div class="mb-2">{{ slotProps.data.description }}</div>
                          <Button
                            :label="$t('hotels.rooms')"
                            icon="pi pi-key"
                            class="p-button-sm"
                            @click="viewHotel(slotProps.data.id)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </DataView>
          </div>
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
const layout = ref('grid');

// Propiedades computadas
const isOwner = computed(() => user.value?.user_type === 'Owner');
const hasSubscription = computed(() => user.value?.subscription_id !== null);

const hotelsCount = computed(() => isOwner.value ? hotels.value.length : 0);
const roomsCount = computed(() => isOwner.value ? rooms.value.length : 0);
const reservationsCount = computed(() => reservations.value.length);

const filteredHotels = computed(() => {
  if (!searchQuery.value.trim()) {
    return hotels.value;
  }

  const query = searchQuery.value.toLowerCase();
  return hotels.value.filter(hotel =>
    hotel.name.toLowerCase().includes(query) ||
    hotel.address.toLowerCase().includes(query) ||
    hotel.description?.toLowerCase().includes(query)
  );
});

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    if (isOwner.value) {
      // Cargar hoteles del propietario
      hotels.value = await hotelRepository.findByOwnerId(user.value.id);

      // Cargar todas las habitaciones de los hoteles del propietario
      const roomsPromises = hotels.value.map(hotel =>
        roomRepository.findByHotelId(hotel.id)
      );
      const roomsArrays = await Promise.all(roomsPromises);
      rooms.value = roomsArrays.flat();
    } else {
      // Para visitantes, cargar todos los hoteles
      hotels.value = await hotelRepository.findAll();
    }

    // Cargar reservaciones del usuario
    reservations.value = await reservationRepository.findByUserId(user.value.id);
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
  router.push(`/hotels/${id}`);
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

.hotel-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.hotel-card .p-card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.hotel-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.hotel-image-list {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.hotel-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hotel-address {
  color: #666;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .hotel-image-list {
    width: 100%;
    height: 150px;
    margin-bottom: 1rem;
  }

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
