<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
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
const route = useRoute();
const loading = ref(true);
const reservation = ref(null);
const roomDetails = ref(null);
const hotelDetails = ref(null);

// Verificar si es propietario o cliente
const isOwner = computed(() => userStore.currentUser?.type_user === 'owner');
const isClient = computed(() => userStore.currentUser?.type_user === 'client');

// Verificar si es la reserva del usuario actual
const isMyReservation = computed(() => {
  return reservation.value && userStore.currentUser &&
         reservation.value.users_id === userStore.currentUser.id;
});

// Verificar si es reserva en uno de los hoteles del propietario
const isMyHotelReservation = computed(() => {
  if (!isOwner.value || !reservation.value || !roomDetails.value || !hotelDetails.value) {
    return false;
  }
  return hotelDetails.value.users_id === userStore.currentUser.id;
});

onMounted(async () => {
  const reservationId = parseInt(route.params.id);

  if (!reservationId) {
    router.push({ name: 'reservation-list' });
    return;
  }

  // Cargar datos necesarios
  if (roomStore.rooms.length === 0) {
    await roomStore.fetchRooms();
  }

  if (hotelStore.hotels.length === 0) {
    await hotelStore.fetchHotels();
  }

  // Cargar la reserva específica
  reservation.value = await reservationStore.getReservationById(reservationId);

  if (!reservation.value) {
    router.push({ name: 'reservation-list' });
    return;
  }

  // Cargar detalles de la habitación y hotel
  roomDetails.value = roomStore.rooms.find(r => r.id === reservation.value.rooms_id);

  if (roomDetails.value) {
    hotelDetails.value = hotelStore.hotels.find(h => h.id === roomDetails.value.hotels_id);
  }

  // Verificar acceso
  const canAccess = isMyReservation.value || isMyHotelReservation.value;
  if (!canAccess) {
    router.push({ name: 'reservation-list' });
    return;
  }

  loading.value = false;
});

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

// Calcular duración de la estancia
const getDuration = () => {
  if (!reservation.value) return '';
  const start = new Date(reservation.value.start_date);
  const end = new Date(reservation.value.end_date);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
};

// Calcular precio total
const getTotalPrice = () => {
  if (!reservation.value || !roomDetails.value) return 0;
  const start = new Date(reservation.value.start_date);
  const end = new Date(reservation.value.end_date);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * roomDetails.value.price;
};

const confirmCancel = async () => {
  if (confirm(t('reservations.confirmCancel'))) {
    await reservationStore.deleteReservation(reservation.value.id);
    router.push({ name: 'reservation-list' });
  }
};

const goBack = () => {
  router.push({ name: 'reservation-list' });
};
</script>

<template>
  <div class="reservation-detail p-4">
    <div v-if="loading" class="flex justify-content-center">
      <pv-progress-spinner />
    </div>

    <div v-else>
      <div class="flex justify-content-between mb-4 align-items-center">
        <h1 class="text-2xl font-bold">{{ t('reservations.detailTitle') }}</h1>
        <div>
          <pv-button
            v-if="isMyReservation"
            icon="pi pi-times"
            label="Cancelar reserva"
            class="p-button-danger"
            @click="confirmCancel"
          />
          <pv-button
            icon="pi pi-arrow-left"
            label="Volver"
            class="p-button-secondary ml-2"
            @click="goBack"
          />
        </div>
      </div>

      <div class="grid">
        <!-- Detalles del hotel -->
        <div class="col-12 md:col-6 lg:col-4">
          <pv-panel header="Hotel">
            <div v-if="hotelDetails" class="detail-card p-3">
              <div class="mb-3">
                <img :src="hotelDetails.imagen || 'https://via.placeholder.com/150'"
                     class="w-full border-round" alt="hotel image" style="max-height: 200px; object-fit: cover;" />
              </div>
              <h2 class="text-xl font-bold mb-2">{{ hotelDetails.name }}</h2>
              <div class="flex align-items-center gap-2 mb-2">
                <i class="pi pi-map-marker"></i>
                <span>{{ hotelDetails.address }}</span>
              </div>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-phone"></i>
                <span>{{ hotelDetails.phone }}</span>
              </div>
            </div>
          </pv-panel>
        </div>

        <!-- Detalles de la habitación -->
        <div class="col-12 md:col-6 lg:col-4">
          <pv-panel header="Habitación">
            <div v-if="roomDetails" class="detail-card p-3">
              <h3 class="text-lg font-bold mb-2">
                Habitación {{ roomStore.getRoomTypeLabel(roomDetails.type_room) }}
              </h3>
              <div class="flex align-items-center gap-2 mb-2">
                <i class="pi pi-tag"></i>
                <span>{{ roomDetails.price }}€ / noche</span>
              </div>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-calculator"></i>
                <span>Total: {{ getTotalPrice() }}€ ({{ getDuration() }})</span>
              </div>
            </div>
          </pv-panel>
        </div>

        <!-- Detalles de la reserva -->
        <div class="col-12 lg:col-4">
          <pv-panel header="Información de reserva">
            <div class="detail-card p-3">
              <div class="mb-3">
                <div class="font-bold mb-1">Check-in:</div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-calendar-plus"></i>
                  <span>{{ formatDate(reservation.start_date) }}</span>
                </div>
              </div>
              <div class="mb-3">
                <div class="font-bold mb-1">Check-out:</div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-calendar-minus"></i>
                  <span>{{ formatDate(reservation.end_date) }}</span>
                </div>
              </div>
              <div class="mb-3">
                <div class="font-bold mb-1">Estancia:</div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-clock"></i>
                  <span>{{ getDuration() }}</span>
                </div>
              </div>
              <div v-if="isMyHotelReservation">
                <div class="font-bold mb-1">Cliente:</div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-user"></i>
                  <span>{{ userStore.users.find(u => u.id === reservation.users_id)?.name || 'Cliente' }}</span>
                </div>
              </div>
            </div>
          </pv-panel>
        </div>
      </div>
    </div>
  </div>
</template>
