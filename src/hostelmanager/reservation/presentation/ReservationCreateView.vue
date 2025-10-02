<template>
  <div class="reservation-create">
    <div class="p-card p-shadow-2 mb-4">
      <div class="p-card-body">
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <div class="p-card-title mb-0">{{ $t('reservations.create') }}</div>
            <div v-if="room" class="p-card-subtitle">
              {{ hotel?.name }} - {{ $t('rooms.roomNumber') }} {{ room.room_number }}
            </div>
          </div>
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            class="p-button-secondary"
            @click="goBack"
          />
        </div>

        <div v-if="loading" class="flex justify-content-center my-5">
          <ProgressSpinner />
        </div>
        <div v-else-if="!room" class="text-center my-5">
          <div class="mb-3">
            <i class="pi pi-exclamation-circle" style="font-size: 2rem"></i>
          </div>
          <p>{{ $t('rooms.notFound') }}</p>
          <Button
            :label="$t('common.back')"
            icon="pi pi-arrow-left"
            class="p-button-secondary mt-3"
            @click="goBack"
          />
        </div>
        <div v-else-if="room.status !== 'Available'" class="text-center my-5">
          <Message severity="warn" :closable="false">
            <div class="flex align-items-center">
              <i class="pi pi-exclamation-triangle mr-3"></i>
              <span>{{ $t('reservations.roomNotAvailable') }}</span>
            </div>
          </Message>
          <Button
            :label="$t('common.back')"
            icon="pi pi-arrow-left"
            class="p-button-secondary mt-3"
            @click="goBack"
          />
        </div>
        <div v-else>
          <!-- Detalles de la habitación -->
          <div class="grid">
            <div class="col-12 md:col-5">
              <img :src="room.image" :alt="room.room_number" class="room-image mb-3 w-full" />
              <div class="room-details p-3 bg-gray-100 border-round">
                <div class="flex justify-content-between mb-3">
                  <div class="font-bold">{{ $t(`rooms.types.${room.typeroom.toLowerCase()}`) }}</div>
                  <div>
                    <i class="pi pi-users mr-1"></i>
                    <span>{{ room.capacity }}</span>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="font-bold text-xl text-primary">{{ formatPrice(room.price) }}</div>
                  <div class="text-sm text-500">{{ $t('rooms.price') }}</div>
                </div>

                <div v-if="room.description" class="mb-3">
                  <div class="font-bold mb-1">{{ $t('rooms.description') }}:</div>
                  <div>{{ room.description }}</div>
                </div>

                <div v-if="room.amenities && room.amenities.length > 0">
                  <div class="font-bold mb-1">{{ $t('rooms.amenities') }}:</div>
                  <div class="flex flex-wrap gap-1">
                    <Chip v-for="(amenity, index) in room.amenities" :key="index" :label="amenity" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario de reserva -->
            <div class="col-12 md:col-7">
              <form @submit.prevent="makeReservation">
                <div class="p-fluid">
                  <div class="field">
                    <label for="checkIn">{{ $t('reservations.checkIn') }} *</label>
                    <Calendar
                      id="checkIn"
                      v-model="reservation.checkIn"
                      dateFormat="dd/mm/yy"
                      :minDate="minDate"
                      :class="{'p-invalid': v$.checkIn.$invalid && submitted}"
                      @change="calculateTotalPrice"
                    />
                    <small v-if="v$.checkIn.$invalid && submitted" class="p-error">
                      {{ $t('common.required') }}
                    </small>
                  </div>

                  <div class="field">
                    <label for="checkOut">{{ $t('reservations.checkOut') }} *</label>
                    <Calendar
                      id="checkOut"
                      v-model="reservation.checkOut"
                      dateFormat="dd/mm/yy"
                      :minDate="minCheckOutDate"
                      :class="{'p-invalid': v$.checkOut.$invalid && submitted}"
                      @change="calculateTotalPrice"
                    />
                    <small v-if="v$.checkOut.$invalid && submitted" class="p-error">
                      {{ v$.checkOut.required.$message || $t('reservations.dateError') }}
                    </small>
                  </div>

                  <div class="field">
                    <label for="guests">{{ $t('reservations.guests') }} *</label>
                    <div class="p-inputgroup">
                      <Button type="button" icon="pi pi-minus" @click="decrementGuests" :disabled="reservation.guests <= 1" />
                      <InputNumber
                        id="guests"
                        v-model="reservation.guests"
                        :min="1"
                        :max="room.capacity"
                        :class="{'p-invalid': v$.guests.$invalid && submitted}"
                        :showButtons="false"
                      />
                      <Button type="button" icon="pi pi-plus" @click="incrementGuests" :disabled="reservation.guests >= room.capacity" />
                    </div>
                    <small class="text-muted">{{ $t('rooms.capacity') }}: {{ room.capacity }}</small>
                    <small v-if="v$.guests.$invalid && submitted" class="p-error block">
                      {{ $t('common.required') }}
                    </small>
                  </div>

                  <div class="field">
                    <div class="p-card p-shadow-1">
                      <div class="p-card-body">
                        <div class="flex justify-content-between">
                          <div>{{ $t('reservations.totalPrice') }}</div>
                          <div class="text-xl font-bold">{{ formatPrice(reservation.totalPrice) }}</div>
                        </div>
                        <div class="text-sm text-500">
                          {{ nightsCount }} {{ nightsCount === 1 ? 'noche' : 'noches' }} x {{ formatPrice(room.price) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-content-end gap-2 mt-4">
                    <Button
                      type="button"
                      :label="$t('common.cancel')"
                      icon="pi pi-times"
                      class="p-button-text"
                      @click="goBack"
                    />
                    <Button
                      type="submit"
                      :label="$t('reservations.create')"
                      icon="pi pi-calendar-plus"
                      class="p-button-success"
                      :loading="saving"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación de reservación -->
    <Dialog
      v-model:visible="confirmationDialog"
      :style="{ width: '450px' }"
      :header="$t('reservations.create')"
      :modal="true"
      :closable="!saving"
    >
      <div class="confirmation-content">
        <div>
          <div class="mb-3">{{ $t('reservations.details') }}:</div>
          <div class="p-card p-shadow-1 p-3 mb-3">
            <div><strong>{{ hotel?.name }}</strong> - {{ $t('rooms.roomNumber') }} {{ room?.room_number }}</div>
            <div class="mt-2">
              <i class="pi pi-calendar mr-2"></i>
              <span>{{ formatDate(reservation.checkIn) }} - {{ formatDate(reservation.checkOut) }}</span>
            </div>
            <div class="mt-2">
              <i class="pi pi-users mr-2"></i>
              <span>{{ reservation.guests }}</span>
            </div>
            <div class="font-bold text-xl mt-2">{{ formatPrice(reservation.totalPrice) }}</div>
          </div>
          <div>{{ $t('common.confirm') }}?</div>
        </div>
      </div>
      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          class="p-button-text"
          @click="confirmationDialog = false"
          :disabled="saving"
        />
        <Button
          :label="$t('common.confirm')"
          icon="pi pi-check"
          class="p-button-success"
          @click="confirmReservation"
          :loading="saving"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { ReservationRepository } from '../infrastructure/ReservationRepository';
import { RoomRepository } from '../../room/infrastructure/RoomRepository';
import { HotelRepository } from '../../hotels/infrastructure/HotelRepository';
import { UserRepository } from '../../profile/infrastructure/UserRepository';

// Composables
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Repositorios
const reservationRepository = new ReservationRepository();
const roomRepository = new RoomRepository();
const hotelRepository = new HotelRepository();
const userRepository = new UserRepository();

// Estado
const user = ref(userRepository.getCurrentUser());
const loading = ref(true);
const saving = ref(false);
const submitted = ref(false);
const confirmationDialog = ref(false);
const room = ref(null);
const hotel = ref(null);
const roomId = computed(() => route.params.id);

// Fecha mínima para check-in (hoy)
const minDate = new Date();

// Reserva
const reservation = reactive({
  checkIn: new Date(),
  checkOut: new Date(new Date().setDate(new Date().getDate() + 1)), // Mañana por defecto
  guests: 1,
  totalPrice: 0
});

// Validaciones
const isDateValid = (value) => {
  if (!value || !reservation.checkIn) return true;
  return new Date(value) > new Date(reservation.checkIn);
};

const rules = {
  checkIn: { required },
  checkOut: { required, isDateValid },
  guests: { required }
};

const v$ = useVuelidate(rules, reservation);

// Propiedades computadas
const minCheckOutDate = computed(() => {
  if (!reservation.checkIn) return new Date();
  const date = new Date(reservation.checkIn);
  date.setDate(date.getDate() + 1);
  return date;
});

const nightsCount = computed(() => {
  if (!reservation.checkIn || !reservation.checkOut) return 0;
  const checkIn = new Date(reservation.checkIn);
  const checkOut = new Date(reservation.checkOut);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Métodos
const loadData = async () => {
  loading.value = true;

  try {
    // Verificar si el usuario es visitante
    if (!user.value || user.value.user_type !== 'Visitor') {
      router.push('/dashboard');
      return;
    }

    // Cargar habitación
    const roomData = await roomRepository.findById(roomId.value);
    if (!roomData) {
      throw new Error('Habitación no encontrada');
    }
    room.value = roomData;

    // Cargar hotel
    const hotelData = await hotelRepository.findById(roomData.hotel_id);
    if (!hotelData) {
      throw new Error('Hotel no encontrado');
    }
    hotel.value = hotelData;

    // Calcular precio inicial
    calculateTotalPrice();
  } catch (error) {
    console.error('Error loading room data:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(price);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const calculateTotalPrice = () => {
  if (!room.value || !reservation.checkIn || !reservation.checkOut) return;

  const nights = nightsCount.value;
  reservation.totalPrice = nights * room.value.price;
};

const goBack = () => {
  router.go(-1);
};

const incrementGuests = () => {
  if (reservation.guests < room.value.capacity) {
    reservation.guests++;
  }
};

const decrementGuests = () => {
  if (reservation.guests > 1) {
    reservation.guests--;
  }
};

const makeReservation = async () => {
  submitted.value = true;

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  // Mostrar diálogo de confirmación
  confirmationDialog.value = true;
};

const confirmReservation = async () => {
  saving.value = true;

  try {
    // Verificar disponibilidad de la habitación
    const isAvailable = await reservationRepository.isRoomAvailable(
      roomId.value,
      reservation.checkIn.toISOString().split('T')[0],
      reservation.checkOut.toISOString().split('T')[0]
    );

    if (!isAvailable) {
      throw new Error(t('reservations.roomNotAvailable'));
    }

    // Crear reservación
    const newReservation = await reservationRepository.makeReservation(
      roomId.value,
      user.value.id,
      reservation.checkIn.toISOString().split('T')[0],
      reservation.checkOut.toISOString().split('T')[0],
      reservation.totalPrice
    );

    if (newReservation) {
      // Actualizar estado de la habitación
      await roomRepository.updateStatus(roomId.value, 'Occupied');

      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('reservations.createSuccess'),
        life: 3000
      });

      // Redirigir a la lista de reservaciones
      router.push('/reservations');
    } else {
      throw new Error('No se pudo crear la reservación');
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message,
      life: 3000
    });
    confirmationDialog.value = false;
  } finally {
    saving.value = false;
  }
};

// Ciclo de vida
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.reservation-create {
  padding: 1rem;
}

.room-image {
  border-radius: 6px;
  max-height: 280px;
  object-fit: cover;
}
</style>
