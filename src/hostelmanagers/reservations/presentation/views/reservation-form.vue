<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import useReservationStore from '../../application/reservation.store.js';
import useRoomStore from '../../../rooms/application/room.store.js';
import useHotelStore from '../../../hotels/application/hotel.store.js';
import useUserStore from '../../../users/application/user.store.js';
import { Reservation } from '../../domain/model/reservation.entity.js';

const { t } = useI18n();
const reservationStore = useReservationStore();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const loading = ref(false);

// Valores para el formulario
const selectedHotel = ref(null);
const availableRooms = ref([]);
const selectedRoom = ref(null);
const startDate = ref(null);
const endDate = ref(null);
const errors = ref({
  hotel: '',
  room: '',
  dates: ''
});

// Inicializar con fecha de inicio mañana y fin en 3 días
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(12, 0, 0, 0); // Mediodía

const dayAfterTomorrow = new Date(tomorrow);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
dayAfterTomorrow.setHours(12, 0, 0, 0);

startDate.value = tomorrow.toISOString();
endDate.value = dayAfterTomorrow.toISOString();

// Verificar si el usuario es visitante (cambio de client a visitor)
const isVisitor = computed(() => {
  return userStore.currentUser && userStore.currentUser.type_user === 'visitor';
});

onMounted(async () => {
  loading.value = true;

  // Redireccionar si no es visitante
  if (!userStore.currentUser || !isVisitor.value) {
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

  await reservationStore.fetchReservations();

  // Si se proporciona un hotelId en la query, preseleccionar ese hotel
  if (route.query.hotelId) {
    const hotelId = parseInt(route.query.hotelId);
    selectedHotel.value = hotelStore.hotels.find(h => h.id === hotelId) || null;
    if (selectedHotel.value) {
      updateAvailableRooms();
    }
  }

  loading.value = false;
});

// Actualizar las habitaciones disponibles cuando se selecciona un hotel o cambian las fechas
const updateAvailableRooms = async () => {
  if (!selectedHotel.value || !startDate.value || !endDate.value) {
    availableRooms.value = [];
    selectedRoom.value = null;
    return;
  }

  // Filtrar habitaciones por hotel y disponibilidad
  availableRooms.value = roomStore.rooms.filter(room => {
    return room.hotels_id === selectedHotel.value.id &&
           reservationStore.isRoomAvailable(room.id, startDate.value, endDate.value);
  });

  // Deseleccionar la habitación si ya no está disponible
  if (selectedRoom.value && !availableRooms.value.find(r => r.id === selectedRoom.value.id)) {
    selectedRoom.value = null;
  }
};

// Observadores para actualizar habitaciones disponibles
watch([selectedHotel, startDate, endDate], () => {
  updateAvailableRooms();
}, { deep: true });

const validate = () => {
  let isValid = true;
  errors.value = {
    hotel: '',
    room: '',
    dates: ''
  };

  if (!selectedHotel.value) {
    errors.value.hotel = 'Por favor, selecciona un hotel';
    isValid = false;
  }

  if (!selectedRoom.value) {
    errors.value.room = 'Por favor, selecciona una habitación disponible';
    isValid = false;
  }

  if (!startDate.value || !endDate.value) {
    errors.value.dates = 'Por favor, selecciona las fechas de entrada y salida';
    isValid = false;
  } else {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    const now = new Date();

    if (start < now) {
      errors.value.dates = 'La fecha de entrada no puede ser en el pasado';
      isValid = false;
    } else if (end <= start) {
      errors.value.dates = 'La fecha de salida debe ser posterior a la de entrada';
      isValid = false;
    }
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  loading.value = true;

  try {
    const reservationData = {
      start_date: startDate.value,
      end_date: endDate.value,
      users_id: userStore.currentUser.id,
      rooms_id: selectedRoom.value.id
    };

    const result = await reservationStore.createReservation(reservationData);

    if (result) {
      router.push({ name: 'reservation-list' });
    } else {
      alert('Ha ocurrido un error al crear la reserva');
    }
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    alert('Ha ocurrido un error al crear la reserva');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'reservation-list' });
};

// Formatea el precio de la habitación para mostrar
const formatRoomOption = (room) => {
  if (!room) return '';
  return `${roomStore.getRoomTypeLabel(room.type_room)} - ${room.price}€/noche`;
};
</script>

<template>
  <div class="reservation-create p-4" v-if="!loading">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">{{ t('reservations.createTitle') }}</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="p-fluid">
      <!-- Selección de Hotel -->
      <div class="field mb-4">
        <label for="hotel">Hotel</label>
        <pv-dropdown
          id="hotel"
          v-model="selectedHotel"
          :options="hotelStore.hotels"
          optionLabel="name"
          placeholder="Selecciona un hotel"
          :class="{ 'p-invalid': errors.hotel }"
          filter
          filterMatchMode="contains"
        />
        <small class="p-error" v-if="errors.hotel">{{ errors.hotel }}</small>
      </div>

      <!-- Selección de Fechas -->
      <div class="grid">
        <div class="col-6 field mb-4">
          <label for="startDate">Fecha de entrada</label>
          <pv-calendar
            id="startDate"
            v-model="startDate"
            dateFormat="dd/mm/yy"
            :minDate="new Date()"
            :showTime="true"
            :showButtonBar="true"
            :class="{ 'p-invalid': errors.dates }"
            hourFormat="24"
          />
        </div>

        <div class="col-6 field mb-4">
          <label for="endDate">Fecha de salida</label>
          <pv-calendar
            id="endDate"
            v-model="endDate"
            dateFormat="dd/mm/yy"
            :minDate="startDate ? new Date(startDate) : new Date()"
            :showTime="true"
            :showButtonBar="true"
            :class="{ 'p-invalid': errors.dates }"
            hourFormat="24"
          />
        </div>
      </div>
      <small class="p-error block mb-4" v-if="errors.dates">{{ errors.dates }}</small>

      <!-- Selección de Habitación -->
      <div class="field mb-4">
        <label for="room">Habitación disponible</label>
        <div v-if="selectedHotel && availableRooms.length > 0">
          <pv-dropdown
            id="room"
            v-model="selectedRoom"
            :options="availableRooms"
            optionLabel="id"
            placeholder="Selecciona una habitación"
            :class="{ 'p-invalid': errors.room }"
          >
            <template #option="slotProps">
              {{ formatRoomOption(slotProps.option) }}
            </template>
            <template #value="slotProps">
              {{ slotProps.value ? formatRoomOption(slotProps.value) : 'Selecciona una habitación' }}
            </template>
          </pv-dropdown>
        </div>
        <div v-else-if="selectedHotel" class="p-message p-message-info">
          No hay habitaciones disponibles en las fechas seleccionadas. Por favor, prueba con otras fechas.
        </div>
        <div v-else class="p-message p-message-info">
          Selecciona primero un hotel para ver las habitaciones disponibles.
        </div>
        <small class="p-error" v-if="errors.room">{{ errors.room }}</small>
      </div>

      <div class="flex gap-2 justify-content-end mt-4">
        <pv-button type="button" label="Cancelar" class="p-button-secondary" @click="goBack" />
        <pv-button type="submit" label="Reservar ahora" icon="pi pi-check" />
      </div>
    </form>
  </div>
  <div v-else class="flex justify-content-center">
    <pv-progress-spinner />
  </div>
</template>
