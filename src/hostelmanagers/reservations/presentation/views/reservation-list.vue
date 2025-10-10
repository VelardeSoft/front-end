<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useReservationStore from '../../application/reservation.store.js';
import useRoomStore from '../../../rooms/application/room.store.js';
import useHotelStore from '../../../hotels/application/hotel.store.js';
import useUserStore from '../../../users/application/user.store.js';

const { t } = useI18n();
const reservationStore = useReservationStore();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const userStore = useUserStore();
const router = useRouter();
const loading = ref(false);
const viewType = ref('my'); // 'my' para mis reservas, 'hotel' para reservas de hoteles (solo owners)

// Determina el tipo de usuario
const isClient = computed(() => userStore.currentUser?.type_user === 'client');
const isOwner = computed(() => userStore.currentUser?.type_user === 'owner');

// Reservas a mostrar según la pestaña seleccionada
const displayedReservations = computed(() => {
  if (viewType.value === 'my') {
    return reservationStore.myReservations;
  } else {
    return reservationStore.hotelReservations;
  }
});

onMounted(async () => {
  loading.value = true;

  // Cargar datos necesarios
  if (roomStore.rooms.length === 0) {
    await roomStore.fetchRooms();
  }

  if (hotelStore.hotels.length === 0) {
    await hotelStore.fetchHotels();
  }

  await reservationStore.fetchReservations();
  loading.value = false;
});

const navigateToCreate = () => {
  router.push({ name: 'reservation-create' });
};

const navigateToDetail = (id) => {
  router.push({ name: 'reservation-detail', params: { id } });
};

const confirmCancel = async (id) => {
  if (confirm(t('reservations.confirmCancel'))) {
    await reservationStore.deleteReservation(id);
    await reservationStore.fetchReservations();
  }
};

// Helper para formatear fechas
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper para obtener detalles de la habitación y el hotel
const getRoomAndHotelInfo = (roomId) => {
  const room = roomStore.rooms.find(r => r.id === roomId);
  if (!room) return { roomType: 'Desconocido', hotelName: 'Desconocido' };

  const hotel = hotelStore.hotels.find(h => h.id === room.hotels_id);
  return {
    roomType: roomStore.getRoomTypeLabel(room.type_room),
    hotelName: hotel ? hotel.name : 'Hotel desconocido',
    price: room.price
  };
};
</script>

<template>
  <div class="reservation-list p-4">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">{{ t('reservations.listTitle') }}</h1>
      <pv-button
        icon="pi pi-plus"
        label="Nueva Reserva"
        @click="navigateToCreate"
        v-if="isClient"
      />
    </div>

    <!-- Pestañas para propietarios -->
    <div class="tab-container mb-4" v-if="isOwner">
      <pv-select-button v-model="viewType" :options="[
        {label: 'Mis Reservas', value: 'my'},
        {label: 'Reservas de mis Hoteles', value: 'hotel'}
      ]" />
    </div>

    <pv-data-table
      :value="displayedReservations"
      :paginator="true"
      :rows="10"
      :loading="loading"
      stripedRows
      responsiveLayout="scroll"
      class="p-datatable-sm"
      sortField="start_date"
      :sortOrder="-1"
      removableSort
    >
      <template #empty>
        <div class="text-center p-4">No hay reservas disponibles</div>
      </template>
      <template #loading>
        <div class="text-center p-4">Cargando reservas...</div>
      </template>

      <!-- Columna Hotel/Habitación -->
      <pv-column field="rooms_id" header="Hotel / Habitación" sortable style="width: 25%">
        <template #body="slotProps">
          <div>
            <div class="font-bold">{{ getRoomAndHotelInfo(slotProps.data.rooms_id).hotelName }}</div>
            <div class="text-sm">Hab. {{ getRoomAndHotelInfo(slotProps.data.rooms_id).roomType }}</div>
          </div>
        </template>
      </pv-column>

      <!-- Columna Fechas -->
      <pv-column field="start_date" header="Fechas" sortable style="width: 25%">
        <template #body="slotProps">
          <div>
            <div><i class="pi pi-calendar-plus mr-2"></i> {{ formatDate(slotProps.data.start_date) }}</div>
            <div><i class="pi pi-calendar-minus mr-2"></i> {{ formatDate(slotProps.data.end_date) }}</div>
          </div>
        </template>
      </pv-column>

      <!-- Columna Precio (Condicional) -->
      <pv-column v-if="viewType === 'my'" header="Precio" style="width: 15%">
        <template #body="slotProps">
          {{ getRoomAndHotelInfo(slotProps.data.rooms_id).price }}€ / noche
        </template>
      </pv-column>

      <!-- Columna Cliente (Solo para propietarios) -->
      <pv-column v-if="viewType === 'hotel'" field="users_id" header="Cliente" style="width: 15%">
        <template #body="slotProps">
          {{ userStore.users.find(u => u.id === slotProps.data.users_id)?.name || 'Cliente Desconocido' }}
        </template>
      </pv-column>

      <!-- Columna Acciones -->
      <pv-column header="Acciones" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <pv-button
              icon="pi pi-eye"
              class="p-button-sm p-button-text p-button-info"
              @click="navigateToDetail(slotProps.data.id)"
            />
            <pv-button
              v-if="viewType === 'my'"
              icon="pi pi-times"
              class="p-button-sm p-button-text p-button-danger"
              @click="confirmCancel(slotProps.data.id)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>
