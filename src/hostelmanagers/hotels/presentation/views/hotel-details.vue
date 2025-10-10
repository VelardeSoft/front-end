<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useHotelStore from '../../application/hotel.store.js';
import useRoomStore from '../../../rooms/application/room.store.js';
import useUserStore from '../../../users/application/user.store.js';

const route = useRoute();
const router = useRouter();
const hotelStore = useHotelStore();
const roomStore = useRoomStore();
const userStore = useUserStore();

const hotel = ref(null);
const rooms = ref([]);
const loading = ref(false);

const isOwner = computed(() => {
  return userStore.currentUser && userStore.currentUser.type_user === 'owner';
});

const canEdit = computed(() => {
  return isOwner.value && hotel.value && userStore.currentUser.id === hotel.value.users_id;
});

onMounted(async () => {
  const hotelId = parseInt(route.params.id);
  if (!hotelId) {
    router.push({ name: 'hotel-list' });
    return;
  }

  loading.value = true;
  try {
    // Cargar el hotel
    hotel.value = await hotelStore.getHotelById(hotelId);

    if (!hotel.value) {
      router.push({ name: 'hotel-list' });
      return;
    }

    // Cargar todas las habitaciones y filtrar por este hotel
    await roomStore.fetchRooms();
    rooms.value = roomStore.rooms.filter(room => room.hotels_id === hotelId);

  } catch (error) {
    console.error('Error cargando detalles del hotel:', error);
  } finally {
    loading.value = false;
  }
});

const navigateToEditHotel = () => {
  router.push({ name: 'hotel-edit', params: { id: hotel.value.id } });
};

const navigateToCreateRoom = () => {
  router.push({ name: 'room-create', query: { hotelId: hotel.value.id } });
};

const navigateToEditRoom = (roomId) => {
  router.push({ name: 'room-edit', params: { id: roomId } });
};

const navigateToReserve = () => {
  router.push({ name: 'reservation-create', query: { hotelId: hotel.value.id } });
};

const confirmDeleteRoom = async (roomId) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
    const success = await roomStore.deleteRoom(roomId);
    if (success) {
      // Recargar habitaciones
      await roomStore.fetchRooms();
      rooms.value = roomStore.rooms.filter(room => room.hotels_id === hotel.value.id);
    }
  }
};

const goBack = () => {
  router.push({ name: 'hotel-list' });
};
</script>

<template>
  <div class="hotel-details p-4">
    <div v-if="loading" class="flex justify-content-center align-items-center" style="min-height: 400px;">
      <pv-progress-spinner />
      <span class="ml-3">Cargando detalles del hotel...</span>
    </div>

    <div v-else-if="hotel">
      <!-- Header del hotel -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            size="small"
            @click="goBack"
          />
          <h1 class="text-3xl font-bold m-0">{{ hotel.name }}</h1>
        </div>
        <div class="flex gap-2">
          <pv-button
            v-if="!canEdit"
            icon="pi pi-calendar-plus"
            label="Reservar"
            size="small"
            @click="navigateToReserve"
          />
          <pv-button
            v-if="canEdit"
            icon="pi pi-pencil"
            label="Editar Hotel"
            size="small"
            @click="navigateToEditHotel"
          />
        </div>
      </div>

      <!-- Información del hotel -->
      <div class="grid mb-4">
        <div class="col-12 md:col-6">
          <pv-panel header="Información del Hotel">
            <div class="hotel-info">
              <div class="mb-3">
                <img
                  :src="hotel.imagen || 'https://via.placeholder.com/400x200?text=Hotel'"
                  class="w-full border-round"
                  alt="Hotel image"
                  style="height: 250px; object-fit: cover;"
                />
              </div>
              <div class="flex align-items-center gap-2 mb-2">
                <i class="pi pi-map-marker text-primary"></i>
                <span><strong>Dirección:</strong> {{ hotel.address }}</span>
              </div>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-phone text-primary"></i>
                <span><strong>Teléfono:</strong> {{ hotel.phone }}</span>
              </div>
            </div>
          </pv-panel>
        </div>

        <!-- Estadísticas del hotel -->
        <div class="col-12 md:col-6">
          <pv-panel header="Estadísticas">
            <div class="grid text-center">
              <div class="col-6">
                <div class="bg-blue-100 p-3 border-round">
                  <i class="pi pi-home text-blue-500 text-2xl mb-2 block"></i>
                  <div class="text-2xl font-bold text-blue-500">{{ rooms.length }}</div>
                  <div class="text-sm text-gray-600">Habitaciones</div>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-green-100 p-3 border-round">
                  <i class="pi pi-euro text-green-500 text-2xl mb-2 block"></i>
                  <div class="text-2xl font-bold text-green-500">
                    {{ rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 0 }}€
                  </div>
                  <div class="text-sm text-gray-600">Desde</div>
                </div>
              </div>
            </div>
          </pv-panel>
        </div>
      </div>

      <!-- Gestión de Habitaciones -->
      <pv-panel>
        <template #header>
          <div class="flex justify-content-between align-items-center w-full">
            <span>Habitaciones del Hotel</span>
            <pv-button
              v-if="canEdit"
              icon="pi pi-plus"
              label="Agregar Habitación"
              @click="navigateToCreateRoom"
            />
          </div>
        </template>

        <!-- Lista de habitaciones -->
        <div v-if="rooms.length === 0" class="text-center py-4">
          <i class="pi pi-home text-4xl text-gray-400 mb-3 block"></i>
          <h3 class="text-lg font-semibold mb-2">No hay habitaciones registradas</h3>
          <p class="text-gray-600 mb-3">
            <span v-if="canEdit">Comienza agregando la primera habitación a tu hotel</span>
            <span v-else>Este hotel aún no tiene habitaciones disponibles</span>
          </p>
          <pv-button
            v-if="canEdit"
            icon="pi pi-plus"
            label="Agregar Primera Habitación"
           size="small"
            @click="navigateToCreateRoom"
          />
        </div>

        <div v-else class="grid">
          <div v-for="room in rooms" :key="room.id" class="col-12 md:col-6 lg:col-4">
            <div class="border-1 surface-border border-round p-3 mb-3">
              <div class="flex justify-content-between align-items-start mb-2">
                <div>
                  <h4 class="m-0 mb-1">Habitación {{ roomStore.getRoomTypeLabel(room.type_room) }}</h4>
                  <div class="text-2xl font-bold text-primary">{{ room.price }}€ <span class="text-sm font-normal text-gray-600">/ noche</span></div>
                </div>
                <div v-if="canEdit" class="flex gap-1">
                  <pv-button
                    icon="pi pi-pencil"
                    @click="navigateToEditRoom(room.id)"
                  />
                  <pv-button
                    icon="pi pi-trash"
                    @click="confirmDeleteRoom(room.id)"
                  />
                </div>
              </div>

              <div class="flex align-items-center gap-2 text-sm text-gray-600">
                <i class="pi pi-tag"></i>
                <span>ID: {{ room.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </pv-panel>
    </div>

    <div v-else class="text-center py-8">
      <h3>Hotel no encontrado</h3>
      <pv-button label="Volver a la lista" @click="goBack" />
    </div>
  </div>
</template>

<style scoped>
.hotel-details {
  min-height: calc(100vh - 200px);
}
</style>
