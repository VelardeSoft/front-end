<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import useRoomStore from '../../application/room.store.js';
import useHotelStore from '../../../hotels/application/hotel.store.js';
import useUserStore from '../../../users/application/user.store.js';

const { t } = useI18n();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const rooms = ref([]);
const filteredRooms = ref([]);
const loading = ref(false);
const selectedHotelId = ref(null);

const isOwner = computed(() => {
  return userStore.currentUser && userStore.currentUser.type_user === 'owner';
});

onMounted(async () => {
  loading.value = true;

  // Cargar hoteles si no están cargados
  if (hotelStore.hotels.length === 0) {
    await hotelStore.fetchHotels();
  }

  // Cargar habitaciones
  await roomStore.fetchRooms();
  rooms.value = roomStore.rooms;

  // Si hay un parámetro hotelId en la ruta, filtrar por ese hotel
  if (route.query.hotelId) {
    selectedHotelId.value = parseInt(route.query.hotelId);
    filterRoomsByHotel();
  } else {
    filteredRooms.value = rooms.value;
  }

  loading.value = false;
});

const filterRoomsByHotel = () => {
  if (selectedHotelId.value) {
    filteredRooms.value = rooms.value.filter(room => room.hotels_id === selectedHotelId.value);
  } else {
    filteredRooms.value = rooms.value;
  }
};

const navigateToCreate = () => {
  if (selectedHotelId.value) {
    router.push({ name: 'room-create', query: { hotelId: selectedHotelId.value } });
  } else {
    router.push({ name: 'room-create' });
  }
};

const navigateToEdit = (id) => {
  router.push({ name: 'room-edit', params: { id } });
};

const confirmDelete = async (id) => {
  if (confirm(t('rooms.confirmDelete'))) {
    await roomStore.deleteRoom(id);
    await roomStore.fetchRooms();
    rooms.value = roomStore.rooms;
    filterRoomsByHotel();
  }
};

// Función para determinar si el usuario puede editar esta habitación
const canEdit = (room) => {
  if (!isOwner.value) return false;

  // Buscar el hotel al que pertenece esta habitación
  const hotel = hotelStore.hotels.find(h => h.id === room.hotels_id);

  // Solo puede editar si es propietario del hotel
  return hotel && hotel.users_id === userStore.currentUser.id;
};

// Obtener el nombre del hotel
const getHotelName = (hotelId) => {
  const hotel = hotelStore.hotels.find(h => h.id === hotelId);
  return hotel ? hotel.name : 'Hotel desconocido';
};
</script>

<template>
  <div class="room-list p-4">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">{{ t('rooms.listTitle') }}</h1>
      <pv-button
        icon="pi pi-plus"
        label="Nueva Habitación"
        @click="navigateToCreate"
        v-if="isOwner"
      />
    </div>

    <div class="filter-container mb-4">
      <pv-dropdown
        v-model="selectedHotelId"
        :options="hotelStore.hotels"
        optionLabel="name"
        optionValue="id"
        placeholder="Filtrar por hotel"
        class="w-full md:w-20rem"
        :showClear="true"
        @change="filterRoomsByHotel"
      />
    </div>

    <pv-data-table
      :value="filteredRooms"
      :paginator="true"
      :rows="10"
      :loading="loading"
      stripedRows
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="text-center p-4">No hay habitaciones disponibles</div>
      </template>
      <template #loading>
        <div class="text-center p-4">Cargando habitaciones...</div>
      </template>

      <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
      <pv-column field="hotels_id" header="Hotel" sortable style="width: 20%">
        <template #body="slotProps">
          {{ getHotelName(slotProps.data.hotels_id) }}
        </template>
      </pv-column>
      <pv-column field="type_room" header="Tipo" sortable style="width: 20%">
        <template #body="slotProps">
          {{ roomStore.getRoomTypeLabel(slotProps.data.type_room) }}
        </template>
      </pv-column>
      <pv-column field="price" header="Precio" sortable style="width: 15%">
        <template #body="slotProps">
          {{ slotProps.data.price }} €
        </template>
      </pv-column>

      <pv-column header="Acciones" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <pv-button
              icon="pi pi-pencil"
              class="p-button-sm p-button-text p-button-info"
              @click="navigateToEdit(slotProps.data.id)"
              v-if="canEdit(slotProps.data)"
            />
            <pv-button
              icon="pi pi-trash"
              class="p-button-sm p-button-text p-button-danger"
              @click="confirmDelete(slotProps.data.id)"
              v-if="canEdit(slotProps.data)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>
