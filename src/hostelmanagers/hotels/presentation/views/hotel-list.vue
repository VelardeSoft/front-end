<script setup>
import {ref, onMounted, computed} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useHotelStore from '../../application/hotel.store.js';
import useUserStore from '../../../users/application/user.store.js';

const { t } = useI18n();
const store = useHotelStore();
const userStore = useUserStore();
const router = useRouter();
const hotels = ref([]);
const loading = ref(false);

// Mejorar la detección del tipo de usuario
const isOwner = computed(() => {
  const currentUser = userStore.currentUser;
  console.log("Usuario actual en hotel-list:", currentUser);
  return currentUser && currentUser.type_user === 'owner';
});

const isVisitor = computed(() => {
  const currentUser = userStore.currentUser;
  return currentUser && currentUser.type_user === 'visitor';
});

onMounted(async () => {
  console.log("Montando hotel-list, usuario:", userStore.currentUser);
  loading.value = true;
  try {
    await store.fetchHotels();
    hotels.value = store.hotels;
    console.log("Hoteles cargados:", hotels.value);
  } catch (error) {
    console.error("Error al cargar hoteles:", error);
  } finally {
    loading.value = false;
  }
});

const navigateToCreate = () => {
  router.push({ name: 'hotel-create' });
};

const navigateToEdit = (id) => {
  router.push({ name: 'hotel-edit', params: { id } });
};

const navigateToDetails = (id) => {
  router.push({ name: 'hotel-details', params: { id } });
};

const navigateToReserve = (id) => {
  router.push({ name: 'reservation-create', query: { hotelId: id } });
};

const confirmDelete = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este hotel?')) {
    const success = await store.deleteHotel(id);
    if (success) {
      await store.fetchHotels();
      hotels.value = store.hotels;
    }
  }
};

// Verificar si el usuario actual puede editar este hotel
const canEdit = (hotel) => {
  return isOwner.value && userStore.currentUser && userStore.currentUser.id === hotel.users_id;
};
</script>

<template>
  <div class="hotel-list p-4">
    <div class="flex justify-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold mb-2">
          <span v-if="isOwner">Mis Hoteles</span>
          <span v-else>Hoteles Disponibles</span>
        </h1>
      </div>
      <pv-button
        icon="pi pi-plus"
        label="Nuevo Hotel"
        @click="navigateToCreate"
        v-if="isOwner"
        class="p-button-success"
      />
    </div>

    <!-- Mensaje si no hay hoteles -->
    <div v-if="!loading && hotels.length === 0" class="text-center py-8">
      <i class="pi pi-building text-6xl text-gray-400 mb-4"></i>
      <h3 class="text-xl font-semibold mb-2">No hay hoteles disponibles</h3>
      <p class="text-gray-600 mb-4">
        <span v-if="isOwner">Comienza creando tu primer hotel</span>
        <span v-else>No hay hoteles registrados en el sistema</span>
      </p>
      <pv-button
        v-if="isOwner"
        icon="pi pi-plus"
        label="Crear mi primer hotel"
        @click="navigateToCreate"
        class="p-button-success"
      />
    </div>

    <!-- Lista de hoteles -->
    <div v-else class="grid">
      <div v-if="loading" class="col-12">
        <div class="flex justify-content-center align-items-center" style="min-height: 200px;">
          <pv-progress-spinner />
          <span class="ml-3">Cargando hoteles...</span>
        </div>
      </div>

      <div
        v-else
        v-for="hotel in hotels"
        :key="hotel.id"
        class="col-12 md:col-6 lg:col-4 xl:col-3"
      >
        <div class="border-1 surface-border border-round p-4 mb-4 hover:shadow-3 transition-all transition-duration-300">
          <!-- Imagen del hotel -->
          <div class="relative mb-3">
            <img
              :src="hotel.imagen || 'https://via.placeholder.com/300x200?text=Hotel'"
              class="w-full border-round"
              alt="Hotel image"
              style="height: 200px; object-fit: cover;"
            />
            <div v-if="canEdit(hotel)" class="absolute top-0 right-0 p-2">
              <span class="bg-blue-500 text-white px-2 py-1 border-round text-sm">
                <i class="pi pi-user mr-1"></i>Mi Hotel
              </span>
            </div>
          </div>

          <!-- Información del hotel -->
          <div class="mb-3">
            <h3 class="text-xl font-bold mb-2">{{ hotel.name }}</h3>
            <div class="flex align-items-center gap-2 mb-2 text-gray-600">
              <i class="pi pi-map-marker"></i>
              <span>{{ hotel.address }}</span>
            </div>
            <div class="flex align-items-center gap-2 text-gray-600">
              <i class="pi pi-phone"></i>
              <span>{{ hotel.phone }}</span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-2 flex-wrap">
            <!-- Botón Ver para todos -->
            <pv-button
              icon="pi pi-eye"
              label="Ver Detalles"
              @click="navigateToDetails(hotel.id)"
              size="small"
            />

            <!-- Botón Reservar para visitantes -->
            <pv-button
              v-if="isVisitor"
              icon="pi pi-calendar-plus"
              label="Reservar"
              @click="navigateToReserve(hotel.id)"
              size="small"
            />

            <!-- Botones de gestión para propietarios -->
            <template v-if="canEdit(hotel)">
              <pv-button
                icon="pi pi-pencil"
                label="Editar"
                @click="navigateToEdit(hotel.id)"
                size="small"
              />
              <pv-button
                icon="pi pi-trash"
                @click="confirmDelete(hotel.id)"
                size="small"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hotel-list {
  min-height: calc(100vh - 200px);
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.transition-all {
  transition: all 0.3s ease;
}

.hover\:shadow-3:hover {
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}
</style>
